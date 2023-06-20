import Web3 from 'web3';
import barterMarket from '../build/contracts/barterMarket.json';

let web3;
let BarterMarket;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable()
        .then(() => {
          resolve(
            new Web3(window.ethereum)
          );
        })
        .catch(e => {
          reject(e);
        });
      return;
    }
    if(typeof window.web3 !== 'undefined') {
      return resolve(
        new Web3(window.web3.currentProvider)
      );
    }
    resolve(new Web3('http://localhost:9545'));
  });
};

const initContract = () => {
  const deploymentKey = Object.keys(barterMarket.networks)[0];
  return new web3.eth.Contract(
    barterMarket.abi, 
    barterMarket
      .networks[deploymentKey]
      .address
  );
};

const initApp = () => {

  const $authenticateUser = document.getElementById('authenticateUser');
  const $authenticateUserResult = document.getElementById('authenticateUserResult');
  const $acceptProductRequest = document.getElementById('acceptProductRequest');
  const $acceptProductRequestResult = document.getElementById('acceptProductRequestResult');
  const $showCredit = document.getElementById('showCredit');
  const $showCreditResult = document.getElementById('showCreditResult');
  const $checkDifference = document.getElementById('checkDifference');
  const $checkDifferenceResult = document.getElementById('checkDifferenceResult');
  const $checkTimeStamp = document.getElementById('checkTimeStamp');
  const $checkTimeStampResult = document.getElementById('checkTimeStampResult');

  let accounts = [];

  web3.eth.getAccounts()
  .then(_accounts => {
    accounts = _accounts;
    });

  $authenticateUser.addEventListener('submit', (e) => {
    e.preventDefault();

    const reqUserId = e.target.elements[0].value;
    const reqUserAddress = e.target.elements[1].value;

    BarterMarket.methods.authenticateUser(reqUserId, reqUserAddress).send({from: accounts[0]})
      .then(result => {
	$authenticateUserResult.innerHTML = "The User was added to Users list.";
      })
  });

  $acceptProductRequest.addEventListener('submit', (e) => {
    e.preventDefault();

    const reqProductCode = e.target.elements[0].value;

    BarterMarket.methods.acceptProductRequest(reqProductCode).send({from: accounts[0]})
      .then(result => {
	$acceptProductRequestResult.innerHTML = "The product was added to Products list.";
      })
  });

  $showCredit.addEventListener('submit', (e) => {
    e.preventDefault();

    const productId = e.target.elements[0].value;

    BarterMarket.methods.showCredit(productId).call()
      .then(result => {
        BarterMarket.methods.chargeAccount(productId).send({value: result, from: accounts[0]})
          .then(new_result => {
	    $showCreditResult.innerHTML =  `Bazaar has sent ${result} Wei to the owner.`;
          })
      })
  });

  $checkTimeStamp.addEventListener('submit', (e) => {
    e.preventDefault();

    BarterMarket.methods.checkTimeStamp().send({from: accounts[0]})
      .then(result => {
	$checkTimeStampResult.innerHTML =  `Time stamp was checked. see the event results.`;
      })
  });

  $checkDifference.addEventListener('submit', (e) => {
    e.preventDefault();

    BarterMarket.methods.checkDifference().send({from: accounts[0]})
      .then(result => {
        BarterMarket.methods.showCheckDifference().call()
          .then(new_result => {
	    BarterMarket.methods.sellAllCustomerProducts().send({value:new_result, from: accounts[0]})
              .then(final_result => {
	        $checkDifferenceResult.innerHTML = `Bazaar just paid ${new_result} to the owner.`;
              })
          })
      })
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      BarterMarket = initContract();
      initApp(); 
    })
    .catch(e => console.log(e.message));
});
