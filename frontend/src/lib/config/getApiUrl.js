const API_BASE_URL=process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getApiUrl=(subdomain)=>{
    if(!subdomain){
        return API_BASE_URL;
    }
    const url=new URL(API_BASE_URL)
    console.log("urlHostname",url.hostname)
    url.hostname=`${subdomain}.${url.hostname}`
    return url.toString()
}