import React, { Component } from 'react' // 导入react库
import VotingContract from '../build/contracts/Voting.json' // 获取合约本身
import getWeb3 from './utils/getWeb3' // 导入getWeb3工具，用以获取web3接口

// 导入css
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const contractAddress = "0x84559f7a83340fcedad3807337023cf0163d2f44"; // 智能合约在区块链网络的地址
var votingContractInstance; // 智能合约实例

var _modifyVotingCount = (candidates,i,votingCount) => {

  console.log("---------");
  console.log(candidates);
  console.log(i);
  console.log(votingCount);

  let obj = candidates[i];
  obj.votingCount = votingCount;
  return candidates;
}

class App extends Component { // App继承于React的组件
  constructor(props) { // 构造函数
    super(props)

    // 初始状态
    this.state = {
      candidates: [
                    {
                      "name": "bush",
                      "id": 100,
                      "votingCount": 0
                    },
                    {
                      "name": "obama",
                      "id": 101,
                      "votingCount": 0
                    },
                    {
                      "name": "donald",
                      "id": 102,
                      "votingCount": 2
                    },
                  ],
      candidatesVoteCount: ["0","0","0"],
      web3: null
    }
  }

  // 重写父类方法。在安装组件之前立即被调用，相当于init。在这里有2个作用
  // 1) 获取web3实例
  // 2) 获取智能合约实例
  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    // getweb3返回web3实例
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  // 实例化智能合约
  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract') // 获取truffle 提供的智能合约类
    const votingContract = contract(VotingContract) // 使用编译出来的智能合约ABI获取此智能合约的对象
    votingContract.setProvider(this.state.web3.currentProvider) // 设置这个智能合约的提供者，也就是区块链节点

    // Declaring this for later so we can chain functions on SimpleStorage.


    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      console.log("this.state.web3.eth.getAccounts");

      // 【重要】使用votingContract.at(contractAddress)来获取该智能合约在区块链相应地址上的实例
      // 参考 http://truffle.tryblockchain.org/truffle-InteractingWithContracts-%E4%B8%8E%E5%90%88%E7%BA%A6%E4%BA%A4%E4%BA%92.html
      votingContract.at(contractAddress).then((instance) => { 
        console.log("----------");
        console.log(instance);
        votingContractInstance = instance;
        for (let i = 0; i < this.state.candidates.length; i++) {
            let object = this.state.candidates[i];
            console.log(accounts[0]);
            console.log(votingContractInstance);
            console.log(votingContractInstance.totalVotesFor(object.name));
            votingContractInstance.totalVotesFor(object.name).then(result => { // 可以通过这个实例来调用区块链上的智能合约的属性和方法
              console.log(i);
              console.log(result.c[0]);
              this.setState({
                candidates: _modifyVotingCount(this.state.candidates,i,result.c[0])
              });
            });
        }
      })
    })
  }

  render() {
    return (
      <div className="App">
      <ul>
        {
         this.state.candidates.map((object) => {
           console.log(object);
           return (

                <li key={object.id}>候选人：{object.name}          支持票数：{object.votingCount}</li>
            )
         })
        }
      </ul>

      <input
            style={{width: 200,height: 30,borderWidth: 2,marginLeft: 40}}
            placeholder="请输入候选人姓名..."
            ref="candidateInput"
      />

      <button style={{height: 30,borderWidth: 2,marginLeft: 20}} onClick={() => {
        console.log(this.refs.candidateInput);
        console.log(this.refs.candidateInput.value);
        let candidateName = this.refs.candidateInput.value;
        console.log(this.state.web3.eth.accounts[0]);
        votingContractInstance.voteForCandidate(candidateName,{from: this.state.web3.eth.accounts[0]}).then((result => {
          console.log(result);
          console.log(candidateName);
          let number = 0;
          for(let i = 0; i < this.state.candidates.length; i++) {
            let object = this.state.candidates[i];
            if (object.name === candidateName) {
              number = i;
              break;
            }
          }
          votingContractInstance.totalVotesFor(candidateName).then(result => {

            this.setState({
              candidates: _modifyVotingCount(this.state.candidates,number,result.c[0])
            });
          });

        }));
      }}>Voting</button>

      </div>
    );
  }
}

export default App
