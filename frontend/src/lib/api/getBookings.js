import { serverFetch } from "../core/server"

export const getBookings=async(subdomain)=>{
    return serverFetch(subdomain,"api/bookings")
}