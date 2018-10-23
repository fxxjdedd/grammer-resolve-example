
const events = {}

class EventEmitter {
  on(event, cb) {
    (events[event] || (events[event] = [])).push(cb)
  }
  off(event) {
    for(let i = 0; i < events.length; i++) {
      if(event === events[i]) {
        events.splice(i, 1)
        break;
      }
    }
  }
  trigger(event, ...args) {
  
    const cbs = events['*'].slice() || []

    if(event === '*') {
      const _cbs = Object.keys(events)
        .filter(key => key !== '*')
        .reduce((item, next) => {
          const values = events[next]
          item.push(...values)
          return item
        }, [])

      cbs.push(..._cbs)
    } else {
      cbs.push(...events[event])
    }

    for(let i = 0; i < cbs.length; i++) {
      cbs[i].call(this, ...args)
    }
  }
}

const emitter = new EventEmitter();

emitter.on('foo', function(e){
	console.log('listening foo event 1');
});

emitter.on('foo', function(e){
	console.log('listening foo event 2');
});

emitter.on('bar', function(e){
	console.log('listening bar event');
});

// 监听全部事件
emitter.on('*', function(e){
	console.log('listening all events');
});

emitter.trigger('foo', {name : 'John'});
emitter.trigger('bar', {name : 'Sun'});
emitter.trigger('*', {name : 'Sun'});
emitter.off('foo');
