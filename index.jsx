var lw = ethlightjs;
var helpers = ethlightjs.helpers;
var txutils = ethlightjs.txutils;
var web3api = new ethlightjs.blockchainapi.blockappsapi("http://stablenet.blockapps.net");
var ks;
var api = new ethlightjs.blockchainapi.blockappsapi();

var Splash = React.createClass({
    login: function(){
        React.render(<WalletEntry />, document.getElementById('entry'));
        $('#entry').modal('toggle');
    },
    render: function(){
        return (
            <div>
            <h1> Welcome to EtherRoulette!</h1>
            <div id='img'><img src='ethereum.png' ></img></div>
            <button type="button" className="btn btn-primary" onClick={this.login}>Play Now!</button>
            </div>
        );
    }
});
var WalletEntry = React.createClass({
    handleSubmit: function(e){
        e.preventDefault();
        var seed = React.findDOMNode(this.refs.seed).value;
        var pass = React.findDOMNode(this.refs.password).value;
        ks = new lw.keystore(seed, pass);
        ks.generateNewAddress(pass);
        $('#entry').modal('toggle');
        React.unmountComponentAtNode(document.getElementById('splash'));
    React.render(<Table address="98d1a78df9ae9bd8fa0de060253e10c2fa235209" odds= "50"fee=".01"/>, document.getElementById('splash'));
    React.render(
        <NavBar />,
        document.getElementById('navbar')
    );
},
render: function(){
  return (
    <div className = "modal-dialog">
        <div className = "modal-content">
            <div className = "modal-header">
                <h4 className = "modal-title"> Enter your wallet seed and a password to start playing!</h4>
            </div>
            <div className = "modal-body">
                <form className = "form-signin" onSubmit = {this.handleSubmit}>
                    <input type = "text" autoComplete = "off" className = "form-control" placeholder = "Input your 12 word seed here" ref = "seed" required="" autofocus=""/><br/>
                    <input type = "password" name = "password" className = "form-control" placeholder = "Password"  ref = "password" required="" autofocus=""/><br/>
                    <button className = "btn btn-lg btn-primary btn-block" type = "submit">submit</button>
                </form>
            </div>
        </div>
    </div>
  );
}
});

var NavBar = React.createClass({
  getInitialState: function(){
      return {
          balance: 0
      }
  },
  componentDidMount: function(){
      setInterval(this.updateBalance, 500);
  },

  updateBalance: function(){
      api.getBalance(ks.addresses[0], (err, bal)=>{
          if (err){ throw err; }
          var balance = parseInt(bal);
          this.setState({
              balance: balance / (1E18)
          });
      });
  },
    goOne: function(){
    React.unmountComponentAtNode(document.getElementById('splash'));
    React.render(<Table address="98d1a78df9ae9bd8fa0de060253e10c2fa235209" fee=".02" odds="20"/>, document.getElementById('splash'));
    },
    goTwo: function(){
    React.unmountComponentAtNode(document.getElementById('splash'));
    React.render(<Table address="3c14da2011925cebdfd7b7e4b0c539bb4b545428" fee=".04" odds="50"/>, document.getElementById('splash'));
    },
    handleCreate: function(e){
    e.preventDefault();
    React.unmountComponentAtNode(document.getElementById('splash'));
    React.render(<TableCreater />, document.getElementById('splash'));
},
  render: function(){
      return (
          <nav role="navigation" className="navbar navbar-default">
              <div className="navbar-header">
                  <div className="navbar-brand">EtherRoulette</div>
              </div>
              <div id="navbarCollapse" className="collapse navbar-collapse">
                  <ul className="nav navbar-nav">
                      <li ><a href="#" onClick={this.goOne}>Table 1</a></li>
                      <li><a href="#" onClick={this.goTwo}>Table 2</a></li>
                  </ul>
                  <ul className="nav navbar-nav navbar-right">
                      <li>Balance:{this.state.balance} Ether</li>
                  </ul>
              </div>
          </nav>
      );
  }
});
var TableCreater = React.createClass({
createTable: function(){
    var odds = React.getDOMNode(this.refs.odds).value;
    var fees = React.getDOMNode(this.refs.fees).value;
    var address;
},
render: function(){
    return (
        <div>
        <h1>Create Table</h1>
        <form onSubmit={this.createTable}>
        <div className="form-group">
        <label>Table Odds</label>
        <input className="form-control" id="odds" ref="odds" ></input>
        </div>
        <div className="form-group">
        <label>Table Fees</label>
        <input className="form-control" id="fees" ref="fees"></input>
        </div>
        Note: Creating a table will cost 10000 Ether to provide initial balance
        <button className="btn btn-lg btn-primary btn-block" type="submit">Create</button>
        </form>
        </div>
    );
}
});
var Table = React.createClass({
  componentDidMount: function(){
      $('#bet').keyup(this.updatePayout);
      $('#payout').keyup(this.updateBet);
      this.checkTableBalance();
      setInterval(this.checkTableBalance, 500);
  },
getInitialState: function(){
    return {
        balance: 0
        };
    },
    handleRoll: function(e){
        e.preventDefault();

        var bet = parseInt(React.findDOMNode(this.refs.bet).value);
        bet = bet * 1E18;
        fromAddr = ks.addresses[0];
        toAddr = this.props.address;

        api.getNonce(fromAddr, function(err, accNonce){
            if (err){ throw err; }
            txOptions = {
                gasPrice: 12000000000000,
                gasLimit: 3000000,
                value: bet,
                nonce: accNonce
            };
            var abi =  [{"constant": false, "inputs": [{"name": "amount", "type": "uint256"}], "name": "withdraw", "outputs": [], "type": "function"}, {"constant": false, "inputs": [], "name": "kill", "outputs": [], "type": "function"}, {"constant": true, "inputs": [], "name": "owner", "outputs": [{"name": "", "type": "address"}], "type": "function"}, {"constant": false, "inputs": [], "name": "roll", "outputs": [], "type": "function"}, {"inputs": [], "type": "constructor"}];
            helpers.sendFunctionTx(abi, toAddr, 'roll', [], fromAddr, txOptions, api, ks, 'asdf', function(errr, data){if (!errr){ console.log("success")}});
        React.findDOMNode(this.refs.bet).value = "";
        React.findDOMNode(this.refs.payout).value = "";
        });
    },
    updateBet: function(){
        var payout = React.findDOMNode(this.refs.payout).value;
        var bet = payout / (2 * (1 - this.props.fee));
        React.findDOMNode(this.refs.bet).value = bet;
    },
    updatePayout: function(){
        var bet = React.findDOMNode(this.refs.bet).value;
        var payout = bet * 2 * (1 - this.props.fee);
        React.findDOMNode(this.refs.payout).value = payout;
    },

    checkTableBalance: function(){
        api.getBalance(this.props.address, (err, bal)=>{
            if (err){ throw err; }
            var balance = parseInt(bal);
            this.setState({
                balance: balance / (1E18)
            });
        });
    },
    render: function(){
        return (
            <div>
                <div id="starholder">
                    <div id="star"></div>
                </div>
                <h1>Table Odds: {this.props.odds}%</h1>
                <p>Table Balance:{this.state.balance}  Table Fee:2%</p>
                <form onSubmit={this.handleRoll}>
                <div className="form-group">
                    <label>Bet Amount</label>
                    <input className="form-control" id="bet" ref="bet" ></input>
                </div>
                <div className="form-group">
                    <label>Possible Payout</label>
                    <input className="form-control" id="payout" ref="payout"></input>
                </div>
                <button className="btn btn-lg btn-primary btn-block" type="submit">Roll</button>
                </form>
            </div>
        );
    }
});
React.render(
    <Splash />,
    document.getElementById('splash')
);

