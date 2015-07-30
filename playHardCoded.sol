contract Play{
    address public owner;
    address player;
    uint bet;
    uint randnum;
    bytes32 rand;
    uint cons;
    uint tableOdds;
    uint tableFee;

  function Play(){
    owner = tx.origin;
    cons = 1000000000;
    tableOdds = 500000000;
    tableFee = 10000000;
  }

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
