

const TenantsHomePage =async ({params}) => {
    const {subdomain}=await params
    return (
        <div>
            {subdomain} Home Page
        </div>
    );
};

export default TenantsHomePage;