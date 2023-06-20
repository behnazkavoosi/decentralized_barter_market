const barterMarket = artifacts.require('barterMarket');

contract('barterMarket', (accounts) => {
  let BarterMarket = null;
  before(async () => {
    BarterMarket = await barterMarket.deployed();
  });
  let bazaar = accounts[0];
  let user1 = accounts[1];
  let user2 = accounts[2];

  it('Should create a new user', async () => {

    await BarterMarket.createUser('Behnaz', 'Kavoosi', 'dummy1@yahoo.com', '1256', {from: user1});
    await BarterMarket.createUser('name', 'lastname', 'dummy2@gmail.com', '1348', {from: user2});

    await BarterMarket.authenticateUser('1256', '0xb48666ed0167aa8b977e919f1cb5f9ba70a81b70', {from: bazaar});
    await BarterMarket.authenticateUser('1348', '0xdc6f827ff3205194b2813a63723e16d0a88dca9d', {from: bazaar});
    
    const newUser1 = await BarterMarket.getUser('0xb48666ed0167aa8b977e919f1cb5f9ba70a81b70');
    const newUser2 = await BarterMarket.getUser('0xdc6f827ff3205194b2813a63723e16d0a88dca9d');

    assert(newUser1[0] === 'Behnaz');
    assert(newUser1[1] === 'Kavoosi');
    assert(newUser1[2].toNumber() === 1256);

    assert(newUser2[0] === 'Mohamad');
    assert(newUser2[1] === 'Kavoosi');
    assert(newUser2[2].toNumber() === 1348);
  });

  it('Should add new product to bazaar', async () => {

    await BarterMarket.enterProductInformation('Pak', '1', '1000', 'Milk', '25', {from: user1});
    await BarterMarket.acceptProductRequest('25', {from: bazaar});

    const newProduct1 = await BarterMarket.showAllProducts(1);
    assert(newProduct1[0] === 'Milk');
    assert(newProduct1[1] === 'Pak');
    assert(newProduct1[2].toNumber() === 1000);


  });

 it('Should charge user account', async () => {

    await BarterMarket.chargeAccount(1, {value: 700000000000000000, from: bazaar});
  });

   it('Should query a product', async () => {
    await BarterMarket.queryProduct('Milk', 'Pak', {from: user2});
    const newProductIdInformation = await BarterMarket.showFoundIdInformation();

    assert(newProductIdInformation[0].toNumber() === 1);
    assert(newProductIdInformation[1].toNumber() === 1000);
    assert(newProductIdInformation[2].toNumber() === 1);
    assert(newProductIdInformation[3] === 'Pak');
    assert(newProductIdInformation[4] === 'Milk');
  });

  it('Should send ether to seller', async () => {

    await BarterMarket.checkBalanceAndSendtoContract(1000,1,{value: 1000000000000000000, from: user2});
    const productNum = await BarterMarket.checkProductNumber(1);

    //assert(productNum.toNumber() === 1000);

   // await BarterMarket.sendingEtherApproval(1, {from: user2});
    //const newProductNum = await BarterMarket.checkProductNumber(1);

    //assert(newProductNum.toNumber() === 0);
  });

  it('Should pay back to seller', async () => {

    //await BarterMarket.sellAllCustomerProducts({value: 250000000000000000, from: bazaar});

  });

});



