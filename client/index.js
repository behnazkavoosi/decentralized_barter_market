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

  const $createUser = document.getElementById('createUser');
  const $createUserResult = document.getElementById('createUserResult');
  const $getUser = document.getElementById('getUser');
  const $getUserResult = document.getElementById('getUserResult');
  const $enterProductInformation = document.getElementById('enterProductInformation');
  const $enterProductInformationResult = document.getElementById('enterProductInformationResult');
  const $getId = document.getElementById('getId');
  const $getIdResult = document.getElementById('getIdResult');
  const $queryProduct = document.getElementById('queryProduct');
  const $queryProductResult = document.getElementById('queryProductResult');
  const $neededBalance = document.getElementById('neededBalance');
  const $neededBalanceResult = document.getElementById('neededBalanceResult');
  const $sendEtherToContract = document.getElementById('sendEtherToContract');
  const $sendEtherToContractResult = document.getElementById('sendEtherToContractResult');
  const $cancelRequest = document.getElementById('cancelRequest');
  const $cancelRequestResult = document.getElementById('cancelRequestResult');
  const $sendApproval = document.getElementById('sendApproval');
  const $sendApprovalResult = document.getElementById('sendApprovalResult');




  let accounts = [];

  web3.eth.getAccounts()
  .then(_accounts => {
    accounts = _accounts;
    });

  $createUser.addEventListener('submit', (e) => {
    e.preventDefault();

    const userName = e.target.elements[0].value;
    const userLastName = e.target.elements[1].value;
    const userMail = e.target.elements[2].value;
    const userId = e.target.elements[3].value;
    if 	(document.getElementById('Check').checked){
    BarterMarket.methods.createUser(userName, userLastName, userMail, userId).send({from: accounts[0]})

      .then(result => {
	document.getElementById('Check').checked;
	$createUserResult.innerHTML = 'Please Wait until bazaar confirm your identity.';
      })
      .catch(_e => {
        $createUserResult.innerHTML = `Your address has already been registered. `;
      });
    }
  });

  $getUser.addEventListener('submit', (e) => {
    e.preventDefault();

    const userAddress = e.target.elements[0].value;

    BarterMarket.methods.getUser(userAddress).call()
      .then(result => {
	$getUserResult.innerHTML =  `Name: ${result[0]} Last Name: ${result[1]} User ID: ${result[2]}`;
      })
  });

  $enterProductInformation.addEventListener('submit', (e) => {
    e.preventDefault();

    const productName = e.target.elements[0].value;
    const productPrice = e.target.elements[1].value;
    const productNumber = e.target.elements[2].value;
    const productType = e.target.elements[3].value;
    const productCode = e.target.elements[4].value;

    BarterMarket.methods.enterProductInformation(productName, productPrice, productNumber, productType, productCode).send({from: accounts[0]})
      .then(result => {
	$enterProductInformationResult.innerHTML = 'PLease wait. Bazaar will process your request soon.';
      })
  });


  $getId.addEventListener('submit', (e) => {
    e.preventDefault();

    const yProductName = e.target.elements[0].value;
    const yProductType = e.target.elements[1].value;

    BarterMarket.methods.getId(yProductName, yProductType).send({from: accounts[0]})
      .then(result => {
        BarterMarket.methods.showId().call()
          .then(new_result => {
            BarterMarket.methods.showAllProducts(new_result).call()
              .then(final_result => {
	         $getIdResult.innerHTML = `Your product Id is ${new_result}. Product Type: ${final_result[0]}, Product Name: ${final_result[1]}, Product Number: ${final_result[2]}, Product Price (per number): ${final_result[3]} Wei`;
              })
          })
      })
  });


  $queryProduct.addEventListener('submit', (e) => {
    e.preventDefault();

    const reqProductType = e.target.elements[0].value;
    const reqProductName = e.target.elements[1].value;

    BarterMarket.methods.queryProduct(reqProductType, reqProductName).send({from: accounts[0]})
      .then(result => {
        BarterMarket.methods.showFoundIdInformation().call()
          .then(new_result => {
	    $queryProductResult.innerHTML =  `ID: ${new_result[0]}, Product Number: ${new_result[1]}, Product Price (per number): ${new_result[2]} Wei, Product Name: ${new_result[3]}, Product Type: ${new_result[4]}`;
          })
      })
  });

  $neededBalance.addEventListener('submit', (e) => {
    e.preventDefault();

    const reqProductNum = e.target.elements[0].value;
    const reqProductId = e.target.elements[1].value;

    BarterMarket.methods.neededBalance(reqProductNum, reqProductId).call()
      .then(result => {
	$neededBalanceResult.innerHTML = `To buy this product, You should send ${result} Wei to the contract address.`;
      })
  });

  $sendEtherToContract.addEventListener('submit', (e) => {
    e.preventDefault();

    const rqProductNum = e.target.elements[0].value;
    const rqProductId = e.target.elements[1].value;

    BarterMarket.methods.neededBalance(rqProductNum, rqProductId).call()
      .then(result => {
        BarterMarket.methods.checkBalanceAndSendtoContract(rqProductNum, rqProductId).send({value: result, from: accounts[0]})
          .then(new_result => {
	    $sendEtherToContractResult.innerHTML = `You send ${result} Wei to the contract address. You can click on Approve to continue buying or click on Cancel to withdraw your money.`;
          })
      })
  });

  $cancelRequest.addEventListener('submit', (e) => {
    e.preventDefault();

    const product_ID = e.target.elements[0].value;

    BarterMarket.methods.cancelRequest(product_ID).send({from: accounts[0]})
      .then(result => {
	$cancelRequestResult.innerHTML = `Your request was canceled.`;

      })
  });

  $sendApproval.addEventListener('submit', (e) => {
    e.preventDefault();

    const product_ID = e.target.elements[0].value;

    BarterMarket.methods.sendingEtherApproval(product_ID).send({from: accounts[0]})
      .then(result => {
	$sendApprovalResult.innerHTML = `Your transaction was approved. You will get your product soon.`;
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
