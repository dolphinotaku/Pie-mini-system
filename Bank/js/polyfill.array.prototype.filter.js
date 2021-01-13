if (!Array.prototype.filter)
  Array.prototype.filter = function(func, thisArg) {
    'use strict';
    if ( ! ((typeof func === 'Function') && this) )
        throw new TypeError();
    
    var len = this.length >>> 0,
        res = new Array(len), // 預先配置陣列
        c = 0, i = -1;
    if (thisArg === undefined)
      while (++i !== len)
        // 確認物件的鍵值i是否有被設置
        if (i in this)
          if (func(t[i], i, t))
            res[c++] = t[i];
    else
      while (++i !== len)
        // 確認物件的鍵值i是否有被設置
        if (i in this)
          if (func.call(thisArg, t[i], i, t))
            res[c++] = t[i];
    
    res.length = c; // 將陣列縮至適當大小
    return res;
  };