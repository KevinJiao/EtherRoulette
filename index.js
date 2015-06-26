var lw = ethlightjs;
var helpers = ethlightjs.helpers;
var txutils = ethlightjs.txutils;
var web3api = new ethlightjs.blockchainapi.blockappsapi("http://stablenet.blockapps.net");
var ks;
var api = new ethlightjs.blockchainapi.blockappsapi();

var tableAddress="eb90193d126d0e27dfc446369fd2b956030d8e93";

var Splash = React.createClass({
    login: function(){
        React.render(<WalletEntry />, document.getElementById('entry'));
        $('#entry').modal('toggle');
    },
    render: function(){
        return(
            <div>
            <h1> Welcome to EtherDice!</h1>
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
        React.render(<Table fee=".01"/>, document.getElementById('splash'));
        React.render(
            <NavBar />,
            document.getElementById('navbar')
        );
    },
    render: function(){return(
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
    );}
});
var NavBar = React.createClass({
    getInitialState: function(){
        return {
            balance:0
        }
    },
    componentDidMount:function(){
        setInterval(this.updateBalance, 500);
    },
    updateBalance: function(){
        api.getBalance(ks.addresses[0], (err, bal)=>{
            this.setState({
                balance:bal
            });
        }); 
    },
    render: function(){
        return(
            <nav role="navigation" className="navbar navbar-default">
                <div className="navbar-header">
                    <div className="navbar-brand">EtherDice</div>
                </div>
                <div id="navbarCollapse" className="collapse navbar-collapse">
                    <ul className="nav navbar-nav">
                        <li className="active"><a href="#">Play</a></li>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        <li>Balance:{this.state.balance} Ether</li>
                    </ul>
                </div>
            </nav>
        );
    }        
});

var Table = React.createClass({
    componentDidMount: function(){
        $('#bet').keyup(this.updatePayout); 
        $('#payout').keyup(this.updateBet);
        console.log('bound');
    },
    handleRoll: function(e){
        e.preventDefault();

        var bet = parseInt(React.findDOMNode(this.refs.bet).value);
        bet = bet*1E18;
        fromAddr = ks.addresses[0];
        toAddr ="97b8791c7794ce84409a3fa4227da08d7494ce0e";

        api.getNonce(fromAddr, function(err, accNonce){
            txOptions = {
                gasPrice: 12000000000000,
                gasLimit: 3000000,
                value: bet,
                nonce: accNonce,
            };
            var abi =  [{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[],"name":"roll","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"}];
            helpers.sendFunctionTx(abi,toAddr,'roll', [], fromAddr, txOptions, api, ks, 'asdf', function(err, data){console.log("success")});

        });
    },
    updateBet: function(){
        var payout = React.findDOMNode(this.refs.payout).value;
        var bet = payout/(2*(1-this.props.fee));
        React.findDOMNode(this.refs.bet).value=bet;
    },
    updatePayout: function(){
        var bet = React.findDOMNode(this.refs.bet).value;
        var payout = bet*2*(1-this.props.fee);
        React.findDOMNode(this.refs.payout).value=payout;
    },

    checkTableBalance: function(){
        e.preventDefault();
        console.log("checking balance");
        api.getBalance(tableAddress, function(err, bal){
            console.log("Table has " + bal + "ether");
        });
    },
    render: function(){
        return(
            <div>
                <div id='wheel'><a href="#" onclick={this.checkTableBalance}><img src="wheel.png" onclick={this.checkTableBalance}></img></a></div>
                <h1>Table Odds: 50%</h1>
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
