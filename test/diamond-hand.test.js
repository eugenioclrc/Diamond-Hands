const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Diamond hands", function() {
  let deployer, bob, alice, diamondHands;
  const DEPOSIT_AMOUNT = ethers.utils.parseEther("1");
  

  it("Should deposit", async function() {
    [deployer, bob, alice] = await ethers.getSigners();
    const DiamondHands = await ethers.getContractFactory("DiamondHands", deployer);
    diamondHands = await DiamondHands.deploy();
    await diamondHands.deployed();

    const bobDiamondHands = diamondHands.connect(bob);
    const beforeBalance = await bob.getBalance();
    await expect(bobDiamondHands.deposit({value: DEPOSIT_AMOUNT}))
      .to.emit(diamondHands, 'Deposit')
      .withArgs(bob.address, DEPOSIT_AMOUNT);
    const afterBalance = await bob.getBalance();
    expect(beforeBalance.sub(afterBalance)).to.above(DEPOSIT_AMOUNT, ethers.utils.parseEther("0.00001"));

    expect(await bobDiamondHands.balanceOf(bob.address)).to.be.equal(DEPOSIT_AMOUNT);

    await expect(diamondHands.connect(alice).deposit({value: DEPOSIT_AMOUNT}))
      .to.emit(diamondHands, 'Deposit')
      .withArgs(alice.address, DEPOSIT_AMOUNT);
    
    await expect(diamondHands.connect(deployer).deposit())
      .to.revertedWith('Sanchez, you cheap bastard')
  });

  it("Should widthdraw", async function() {
    await expect(diamondHands.connect(deployer).withdraw(0))
      .to.revertedWith('Invalid amount');
    await expect(diamondHands.connect(bob).withdraw(0))
      .to.revertedWith('Invalid amount');
    
    await expect(diamondHands.connect(bob).withdraw(ethers.utils.parseEther("5")))
      .to.revertedWith('You dont got enough ether');
    await expect(diamondHands.connect(deployer).withdraw(ethers.utils.parseEther("5")))
      .to.revertedWith('You dont got enough ether');

      
    await expect(diamondHands.connect(bob).withdraw(ethers.utils.parseEther("0.5")))
      .to.revertedWith('You paper hands! HODL!');
    await expect(diamondHands.connect(bob).withdrawAll())
      .to.revertedWith('You paper hands! HODL!');
      
    
    await ethers.provider.send("evm_increaseTime", [2 * 365 * 24 * 60 * 60]); // add 2 years
    await ethers.provider.send("evm_mine", []); // add 2 years

    const beforeBalance = await diamondHands.provider.getBalance(diamondHands.address);
    await expect(diamondHands.connect(bob).withdrawAll()).to.emit(diamondHands, 'Withdraw')
      .withArgs(bob.address, DEPOSIT_AMOUNT);
    const afterBalance = await diamondHands.provider.getBalance(diamondHands.address);
    expect(beforeBalance.sub(afterBalance)).to.be.equal(DEPOSIT_AMOUNT);
  });
});