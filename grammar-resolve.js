// 需要解析的对象
const data = {
    "_type": "way",
    "tags": {
        "highway": "lane-white-solid"
    }
}
// 解析算法
const schema = {
    "key": "disableDrag",
    "geometry": ["node", "way"],
    "disable": [
        "any",
        [
            "all",
            ["==", "_type", "way"],
            ["in", "highway", "lane-white-solid", "lane-white-dash"],
            [
                "any",
                ["!has", "vir_type"],
                ["in", "vir_type", "", "0", "3"]
            ]
        ],
        [
            "all",
            ["==", "_type", "node"],
            ["in", "momenta", "board", "pole"]
        ]
    ]
}

// 算法规则
const existentialKeys = ['has', '!has'] // 是否包含
const comparisonKeys = ['==', '!=', '>', '>=', '<', '<='] // 比较
const setMemberShipFilterKeys = ['in', '!in'] // 包含关系
const combiningFilterKeys = ['all', 'any', 'none'] // 多条件过滤

const Errors = {
    grammar: new Error('grammar error!')
}
// util
function isIn(array, key) {
    return array.includes(key)
}

function getBoolResultByOp(array, op) {
    if(op === 'all') {
        return !array.includes(false)
    } else if(op === 'any') {
        return array.includes(true)
    } else if(op === 'none') {
        return !array.some(d => d === true)
    }
}

// judges
function judgeExisting(data, op, key) {
    const judge = op === 'has' ? true : false
    return key in data ? judge : !judge
}

function judgeComparison(data, op, key, value) {
    let result = eval(`data.${key}${op}'${value}'`)
    return result
}

function judgeSetMemberShip(data, op, key, fns) {
    const realOp = op === 'in' ? 'any' : 'none'
    const realFns = fns.map(fn => {
        return ['==', key, fn]
    })
    return judgeCombining(data, realOp, realFns)
}

function judgeCombining(data, op, fns) {
    const result = []
    for(const fn of fns) {
        const [_op, ...rest] = fn 
        if(isIn(setMemberShipFilterKeys, _op)) {
            const [_key, ..._fns] = rest
            result.push(judgeSetMemberShip(data, _op, _key, _fns))
        } else if (isIn(combiningFilterKeys, _op)) {
            const _fns = rest
            result.push(judgeCombining(data, _op, _fns))
        } else {
            // quit
            if (isIn(existentialKeys, _op)) {
                const [_key] = rest
                result.push(judgeExisting(data, _op, _key))
            } else if (isIn(comparisonKeys, _op)) {
                const [_key, value] = rest
                result.push(judgeComparison(data, _op, _key, value))
            } else {
                throw Errors.grammar
            }
        }    
    }
    return getBoolResultByOp(result, op)
}

function generateJudgeResult(judgeMap) {
    for(let key in judgeMap) {
        if(typeof key === 'string') continue
        judgeMap[key] = !judgeMap[key].includes(false)
    }
}

function prepareData(data) {
  // 扁平化处理
  return {
    _type: data._type,
    ...data.tags
  }
}

// main
function judge(data, entry) {
    data = prepareData(data)
    
    const length = entry.length
    let result

    if(length < 2) {
        throw Errors.grammar
    }
    if(length < 3) {
        const [op, _key] = entry
        if(op === 'node') {
            // means?
            console.log('暂时不处理这个规则')
        } else {
            result = judgeExisting(data, op)
        }
    } else {
        const [op, ...rest] = entry
        if(isIn(comparisonKeys, op)) {
            const [_key, value] = rest
            result = judgeComparison(data, op, _key, value)

        } else if(isIn(setMemberShipFilterKeys, op) ) {
            const [_key, ...fns] = rest
            result = judgeSetMemberShip(data, op, _key, fns)

        } else if(isIn(combiningFilterKeys, op) ) {
            const fns = rest
            result = judgeCombining(data, op, fns)

        } else {
            throw Errors.grammar
        }
    }
    return result
}

const result = judge(data, schema.disable)
console.log('result is', result)
