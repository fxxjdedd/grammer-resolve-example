// 实现一个深度优先搜索算法（非递归）

// 主要是为了维持父节点数组下标的指针
function *iterator(arr) {
	if(!Array.isArray(arr)) return
  
	for(let item of arr) {
  	yield item
  }
}

function dfs(tree, name){
	// 请在这里实现
  // cd: child
  // ch: children
  
	let ch = tree.children
	let it = iterator(ch)
	let lastIt
  let value, done
  
  while(!done) {
  	for(({value: cd, done} = it.next()); !done; ({value: cd, done} = it.next())) {
      if(cd.name === name) {
      	return cd
      }
      
      let _ch = cd.children
      // 如果存在子树，就替换当前的遍历器，从而达到深层次遍历的效果
      if(_ch) {
        let _it = iterator(_ch)
        // 需要保存好父节点的遍历器
        lastIt = it
        // 替换当前的遍历器
        it = _it
      } 
    }

    // 如果it不等于lastIt，说明这是父子的关系，代表整体遍历还没结束
    // 如果没有这一步，在遍历完第一个子树的时候，done会被置为true，导致提前退出循环
    if(it !== lastIt) {
      done = false
    }
    
    it = lastIt
  }
  return null
}

var tree = {
	name : '中国',
	children : [
		{
			name : '北京',
			children : [
				{
					name : '朝阳群众'
				},
				{
					name : '海淀区'
				},
                {
					name : '昌平区'
				}
			]
		},
		{
			name : '浙江省',
			children : [
				{
					name : '杭州市',
					code : 0571,
				},
				{
					name : '嘉兴市'
				},
				{
					name : '绍兴市'
				},
				{
					name : '宁波市'
				}
			]
		}
	]
};

var node = dfs(tree, '杭州市');
console.log(node);


