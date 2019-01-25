'use strict';

const fetchOne = (url) => {
  return fetch(url)
    .then((response) => {
      console.log('response at fetchOne()',response);
      return response.text();
    })
};

const createFetchList = (urlsObj) => {
  const keys = Object.keys(urlsObj);
  const promiseList = [];
  
  keys.forEach((key) => {
    const url = urlsObj[key];
    promiseList.push(fetchOne(url)); // push promises to promiseList
  });
  return promiseList;
};


const fetchAll = (urlsObj) => {
  
  return Promise.all(
    createFetchList(urlsObj)
  ).then((dataList) => {
    const asyncAssets = {};
    const keys = Object.keys(urlsObj);
    for (let i=0; i<dataList.length; i++) {
      asyncAssets[keys[i]] = dataList[i]
    }
    return asyncAssets;
  });
};


module.exports = {fetchAll};