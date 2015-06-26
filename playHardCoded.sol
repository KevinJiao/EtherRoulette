contract Play{


  //  event table(address indexed owner, uint funds, uint odds, uint fee);
    address public owner;
    address player;
    //uint tableOdds;
  //  uint tableFee;
    uint bet;
    uint randnum;
    bytes32 rand;
    uint cons;
    uint tableOdds;
    uint tableFee;

  //Struct table{
    //address owner;
  //}
  function Play(){
    owner = tx.origin;
    cons = 1000000000;
    tableOdds = 500000000;
    tableFee = 10000000;
  }

//  function initiate(uint odds, uint fee){
//    table(tx.origin, msg.value, odds, fee);
//    table.watch
//    if (msg.sender == owner){
//      uint tableOdds = odds;
//      uint tableFee = fee;
//    }
//  }

  function roll(){
    player = msg.sender;
    bet = msg.value;
    uint potentialWinnings = (((bet*cons)/tableOdds)*(cons-tableFee))/cons;
    if (potentialWinnings >= this.balance){
      //ERROR, return bet
      player.send(msg.value);
    }
    else{
      //HASH
      rand = sha256(block.coinbase, block.timestamp);
      randnum = uint(rand)%1000000000;
      if (tableOdds >= randnum){
        player.send(potentialWinnings);

      }
    }
  }

  function withdraw(uint amount){
    if (msg.sender == owner && amount <= this.balance){
      owner.send(amount);
    }

  }

  function kill() {
    if (msg.sender == owner) {
      owner.send(this.balance);
      suicide(owner);
    }
  }
}
