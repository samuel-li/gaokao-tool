const fetch=require('sync-request');

const syncFetch = async (url) => {
    var ret = {};
    try{
        const response = fetch.syncFetch(url);
        if(!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);  
        } else {
            ret.status = 'ok';
            ret.data = response.text();;
        }
    } catch(error) {
        ret.status = 'ng';
        ret.error = error;
    }
    return ret;
}

module.exports = syncFetch;
  