pragma solidity >= 0.5.0;
//pragma experimental ABIEncoderV2;

import "./SafeMath.sol";


contract barterMarket {
    
    using SafeMath for uint;
    /*****************************add user variables****************************************/
    struct User {
    uint256 id;
    string firstName;
    string lastName;
    string email;
    // other stuff

    bool set; // This boolean is used to differentiate between unset and zero struct values
    }
    uint count;
    /*****************************add product variables************************************/
    address payable bazaar;
    uint counter;
    address productOwnerAddress;
    uint foundId;
    uint yourProductId;
    struct Product {
        string productName;
        uint pricePerNum;
        uint productCode;
        uint firstProductNumber;
        uint productNumber;
        string productType;
        address payable productOwner;
        bool productSet;
    // other stuff
    }
    
    uint newProductCode;
    mapping(uint => Product) reqProducts;
    mapping(uint => Product) AllProducts;
    mapping (address => uint) ownerProductCount;
    event newProduct(address indexed newOwnerAddress, string newProductName, address indexed newProductOwner, uint newProductNumber);
    /****************************charge account variables***********************************/
    event chargeApproval(address indexed newCustomerAddress, uint credit);
    event foundProductId(uint _fId, string _fIdProductName, string _fIdProductType, uint _fIdProductNumber, uint _fIdProductPrice);
    /*****************************buy by ether variables************************************/
    uint number;
    address payable buyer;
    event Approval(address indexed _newOwnerAddress, uint _price);
    event Cancellation(uint _withdraw, uint _compensation, address indexed _uAddress);
    mapping(address => uint) newBazaarProduct;
    /*****************************sell product variables************************************/
    event soldApproval(address indexed customerAddress, uint allProductsPrice);
    uint productPrice;
    uint zeroNum;
    event zeroNumber(uint _zeroNum);
    uint timeStamp;
    uint contractBalance;
    uint compensation;
    uint withdraw;
    uint checkId;
    /*****************************constructor & modifier************************************/
    constructor() public {
        bazaar = msg.sender;    
    }

    modifier isBazaar() {
        require(msg.sender == bazaar, "only bazaar can do that");
        _;
    }
    
    modifier isNotBazaar() {
        require(msg.sender != bazaar, "only users can do that");
        _;
    }
    
    /********************************How to add new user************************************/
    mapping(address => User) users;    
    mapping(address => User) AllUsers;
    
    event newUser(address indexed userAddress, uint userId, string userFirstName, string userLastName);
    function createUser(string memory _userFirstName, string memory _userLastName, string memory _userEmail, uint _userId) public isNotBazaar{
        
        User storage user = users[msg.sender];
        
      //  count = count.add(1);
        
        require(!user.set);
        users[msg.sender] = User({
        id: _userId,
        firstName: _userFirstName,
        lastName: _userLastName,
	email: _userEmail,
        set: true
    });
    }

    function authenticateUser(uint _userId, address _userAddress) public isBazaar{

	User memory allUsers = AllUsers[_userAddress]; 

        AllUsers[_userAddress] = users[_userAddress];

        emit newUser(_userAddress, AllUsers[_userAddress].id, AllUsers[_userAddress].firstName, AllUsers[_userAddress].lastName);
    }
     
    function getUser(address _userAddress) view public returns(string memory, string memory, uint){
        
        return ((AllUsers[_userAddress]).firstName, AllUsers[_userAddress].lastName, AllUsers[_userAddress].id);
        
    }
    /*******************************How to add new product***********************************/
    function enterProductInformation(string memory _productName, uint _pricePerNum, 
                                     uint _productNumber, string memory _productType, uint _productCode) payable public{
        
        require(AllUsers[msg.sender].id != 0, "You must register in our market, then you can enter your product information");

        newProductCode = _productCode;
        Product memory product = reqProducts[_productCode];
        require(!product.productSet);
        
        reqProducts[_productCode] = Product({
        productName: _productName,
        productCode: _productCode,
        firstProductNumber: _productNumber,
        productNumber: _productNumber,
        productType: _productType,
        pricePerNum: _pricePerNum,
        productOwner: msg.sender,
        productSet: true
    });
    }
    
    function acceptProductRequest(uint _newproductCode) public isBazaar{
        
        counter = counter.add(1);
        Product memory allProduct = AllProducts[counter];
        
        AllProducts[counter] = reqProducts[_newproductCode];
       // ownerProductCount[productOwnerAddress] = ownerProductCount[productOwnerAddress].add(1);
        emit newProduct(reqProducts[_newproductCode].productOwner, AllProducts[counter].productName, AllProducts[counter].productOwner, AllProducts[counter].productNumber);

    }
   
    function getId(string memory _productName, string memory _productType) public returns(uint){
        
        //require(AllProducts[counter].productOwner ==  msg.sender);
        for (uint i = 1; i <= counter; i++){
            if (AllProducts[i].productOwner ==  msg.sender){
                if ((keccak256(abi.encodePacked(AllProducts[i].productType))) == keccak256(abi.encodePacked(_productType))){
                    if ((keccak256(abi.encodePacked(AllProducts[i].productName))) == keccak256(abi.encodePacked(_productName))){
                        yourProductId = i;
                    }
                }
            }
        }
	    return yourProductId;
    }

    function showId() public view returns(uint){

	    return yourProductId;
    }	  
    
    function showAllProducts(uint _id) public view returns(string memory, string memory, uint, uint){
        
        return (AllProducts[_id].productType, AllProducts[_id].productName, AllProducts[_id].productNumber, AllProducts[_id].pricePerNum);
    }
    /********************************How to charge account***********************************/
    function showCredit(uint _productId) public view isBazaar returns(uint){
        return ((AllProducts[_productId].pricePerNum).mul(AllProducts[_productId].firstProductNumber).mul(10**15 wei).mul(70).div(100));
    }
    function chargeAccount(uint _productId) public payable isBazaar{
        
        require(msg.value ==  ((AllProducts[_productId].pricePerNum).mul(AllProducts[_productId].firstProductNumber).mul(10**15 wei).mul(70).div(100)), "Bazaar should send ether as equal as user credits to him/her");
        AllProducts[_productId].productOwner.transfer(address(this).balance);
        emit chargeApproval(AllProducts[_productId].productOwner, ((AllProducts[_productId].pricePerNum).mul(AllProducts[_productId].firstProductNumber).mul(10**15 wei).mul(70).div(100)));
    }
        
    /*******************************How to query a product***********************************/
    function queryProduct(string memory _productType, string memory _productName) public{
        
        foundId = 0;
        for (uint i = 1; i<= counter; i++){
            if ((keccak256(abi.encodePacked(AllProducts[i].productType))) == keccak256(abi.encodePacked(_productType))){
                if ((keccak256(abi.encodePacked(AllProducts[i].productName))) == keccak256(abi.encodePacked(_productName))){
                    foundId = i;
                }
            }
        }
        
        emit foundProductId(foundId, AllProducts[foundId].productName, AllProducts[foundId].productType, AllProducts[foundId].productNumber, AllProducts[foundId].pricePerNum);
    }
    
  /*  function showFoundId() public view returns(uint){
        
        return foundId;
    }*/
    
    function showFoundIdInformation() public view returns(uint, uint, uint, string memory, string memory){
        
        return (foundId, AllProducts[foundId].productNumber, AllProducts[foundId].pricePerNum, AllProducts[foundId].productName, AllProducts[foundId].productType);
    }
    /********************************How to buy by ether************************************/
    function neededBalance(uint _number, uint _foundId) public view returns(uint){

        return ((AllProducts[_foundId].pricePerNum).mul(_number).mul(10**15 wei));
    }

    function checkBalanceAndSendtoContract(uint _number, uint _foundId) payable external{

        require(AllUsers[msg.sender].id != 0, "You must register in our market, then you can enter your product information");
        
        number = _number;
        buyer = msg.sender;
        require(_number <= (AllProducts[_foundId].productNumber), "Sorry. We haven't enough number of this product");
        require(msg.sender.balance >= ((AllProducts[_foundId].pricePerNum).mul(_number).mul(10**15 wei)) , "Sorry! You haven't enough Money. Charge your Account please!");
        require(msg.value == ((AllProducts[_foundId].pricePerNum).mul(_number).mul(10**15 wei)), "You MUST send ether as equal as price");
        AllProducts[_foundId].productNumber =  AllProducts[_foundId].productNumber.sub(number);
        timeStamp = now + 2 hours;
	checkId = _foundId;
    }

    function checkTimeStamp() public isBazaar{


        if (now >= timeStamp){
		contractBalance = address(this).balance;
        	compensation = (contractBalance.mul(5).div(100));
        	withdraw = contractBalance.sub(compensation);
        	buyer.transfer(withdraw);
        	bazaar.transfer(compensation);
        	AllProducts[checkId].productNumber =  AllProducts[checkId].productNumber.add(number);  
        	emit Cancellation(withdraw, compensation, msg.sender);
	}
    }

    function cancelRequest(uint _foundId) payable external {

	require(now < timeStamp);
	contractBalance = address(this).balance;
        compensation = (contractBalance.mul(5).div(100));
        withdraw = contractBalance.sub(compensation);
        buyer.transfer(withdraw);
        bazaar.transfer(compensation);
        AllProducts[_foundId].productNumber =  AllProducts[_foundId].productNumber.add(number);  
        emit Cancellation(withdraw, compensation, msg.sender);
    }
   
    function sendingEtherApproval(uint _foundId) payable external {

	require(now < timeStamp);       
        require(buyer == msg.sender, "you should be the product's owner to approve sending ether.");
        require(address(this).balance == ((AllProducts[_foundId].pricePerNum)*(number)*(10**15 wei)), "Sorry! You didn't send enough Money!");
        bazaar.transfer(address(this).balance);
        emit Approval(msg.sender, (AllProducts[_foundId].pricePerNum).mul(number).mul(10**15 wei));

    }
    /********************************How to sell by ether**********************************/
    function checkDifference() public{

        for (uint i = 1; i<= counter; i++){            
            if ((AllProducts[i].productOwner != bazaar) && (AllProducts[i].productNumber == 0)){                
                zeroNum = i;
	    }
	}
        emit zeroNumber(zeroNum);
    }

    function showCheckDifference() public view returns(uint){

	return ((AllProducts[zeroNum].pricePerNum)*(AllProducts[zeroNum].firstProductNumber).mul(10**15 wei).mul(95).div(100)).sub 
                ((AllProducts[zeroNum].pricePerNum).mul(AllProducts[zeroNum].firstProductNumber).mul(10**15 wei).mul(70).div(100));
    }

    function sellAllCustomerProducts() payable external isBazaar{
                
                uint productPrice = ((AllProducts[zeroNum].pricePerNum)*(AllProducts[zeroNum].firstProductNumber).mul(10**15 wei).mul(95).div(100)).sub 
                ((AllProducts[zeroNum].pricePerNum).mul(AllProducts[zeroNum].firstProductNumber).mul(10**15 wei).mul(70).div(100));
                require(msg.value == productPrice, 
                "All customer's products have been sold, bazaar should send the difference.");
                AllProducts[zeroNum].productOwner.transfer(address(this).balance);
                emit soldApproval(AllProducts[zeroNum].productOwner, productPrice);
		AllProducts[zeroNum].productOwner = bazaar;
 		AllProducts[zeroNum].pricePerNum = 0;

    }

    function checkProductNumber(uint _id) public view returns(uint){
	
	return AllProducts[_id].productNumber;
    }
    //"behnaz","kavoosi" //"Pak","1","1000","Milk", "1256" //2800000000000000000
    //"mohamad","kavoosi" //"farkhonde","1","500","biscuit", "3542" //350000000000000000
    
    
}
