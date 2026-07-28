'use client'

import { usePathname } from "next/navigation";

const Navlinks = ({item}) => {
    const pathName=usePathname()
    const isActive=pathName===item.href;
    return (
        <a href={item.href} className={`block p-3 rounded-lg text-slate-400 hover:bg-slate-900 transition ${isActive&&'bg-indigo-600 text-white font-medium'}`}>{item.text}</a>
    );
};

export default Navlinks;