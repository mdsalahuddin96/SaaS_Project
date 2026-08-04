const Frontend_BASE_URL=process.env.FRONTEND_URL || 'http://localhost:3000';

export const getApiUrl=(subdomain)=>{
    if(!subdomain){
        return Frontend_BASE_URL;
    }
    const url=new URL(Frontend_BASE_URL)
    url.hostname=`${subdomain}.${url.hostname}`
    return url.toString()
}