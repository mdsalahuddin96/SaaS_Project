import React from 'react';

const page = async ({params}) => {
    const {id}=await params
    console.log("about",id)
    return (
        <div>
            about somthing
        </div>
    );
};

export default page;