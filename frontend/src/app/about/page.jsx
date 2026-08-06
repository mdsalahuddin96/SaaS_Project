// import { auth } from "@/lib/auth";
'use client'
import { authClient, useSession } from "@/lib/auth-client";


const AboutPage = () => {
    const session=useSession()
        console.log(session)
    return (
        <div>
            About page
        </div>
    );
};

export default AboutPage;