let count = 0;

class MyComponent extends React.Component{
  constructor(){
    super();
    this.state = {
      count : count
    };
  }
  
  componentWillMount(){
    this.setState({
      count : ++count
    });
    
    this.setState({
      count : ++count
    });
    
    setTimeout(() => {
      this.setState({
        count : ++count
      });

      this.setState({
        count : ++count
      });
    }, 1000);
  }
  
  componentDidMount(){
    this.button.addEventListener('click', this.onClick.bind(this, '原生浏览器事件'), false);
  }
  
  onClick(info) {
    console.log(info);
    
    this.setState({
      count : ++count
    });
    
    this.setState({
      count : ++count
    });
  }
  
  render() {
    console.log(this.state.count);
    return (
      <div>
        <button type="button" ref={node => this.button = node} onClick={this.onClick.bind(this, 'React事件')}>生成新计数</button>
        <div>Count : {this.state.count}</div>
      </div>
    );
  }
}

ReactDOM.render(<MyComponent />, mountNode);

/**
 * 答案:
 * 1.第一次render: 输出 3
 * 2.点击button, 会触发两个事件监听
 * 3.先触发'原生浏览器事件'
 * 4.第二次render: 输出 4，第三次render: 输出 5
 * 5.再触发'React事件'
 * 6.第四次render: 输出 6
 */

/**
 * 这个我还是有专门看过的，可以说，一切的问题都产生于js的事件循环机制
 * 
 * 不论是vue还是react，在进行数据更改的时候，都会有一个异步的任务队列，用户的更改会先push到这个队列，等到下一个事件循环，才会去一次执行队列中的任务
 * 
 * 这是问题的本质
 * 
 * 此外，vue和react都采用了一种间接的方式，来让用户的"第二次更改"延迟到下一次事件循环，vue中是$nextTick, 而react中是setState一个callback
 */

/**
 * 具体来看上面console现象的原因，上面代码有两种事件绑定，也就是我们的callback被传给两种容器，一种是dom原生的事件管理容器，另一种是react的事件管理容器，
 * 因此，当我们点击button的时候，我们callback的调用栈是不一样的，前者调用栈的根源来自dom原生，后者调用栈的根源来自react
 * 
 * 虽然调用栈的根源不一样，但是总归事件的callback是要交给react来处理的，我们从react的生命周期的角度来看这个问题：
 * 
 * React初始化后，会依次执行一些钩子，其中componentDidMount就是其中一个。React为了避免一些不必要re-render，在执行这个钩子之前，会让先让当前的执行状态变为”批处理“，
 * 其实就是一个bool类型的变量，就叫他isBatch吧，先把他设置为true，于是当前事件循环中的所有React管理的事件的结果，都会覆盖到一个dirty对象上去，同样的属性会被覆盖，
 * 等到这批react事件处理完成，再把结果push到异步任务队列，等待下次事件循环执行。
 * 
 * 这之后isBatch将被设为false。 
 * 
 * 当isBatch设置为false的时候，代表我们不需要批处理任务，所以那些"非React管理"的事件，如setTimeout、原生dom事件，会依次push到异步任务队列，等待下次事件循环执行。
 * 
 * 由于，react管理的事件是先push到事件队列，非react管理的事件是后push到事件队列，所以下一次时间循环中，数据的更改是从前往后依次生效的，也这是为什么在componentDidMount中，
 * count最终变为3的原因。
 * 
 */
