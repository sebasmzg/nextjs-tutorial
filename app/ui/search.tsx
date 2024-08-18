'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, 
          useRouter, 
          useSearchParams 
        } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({placeholder}:{placeholder:string}) {
  
  const searchParams = useSearchParams();
  const pathname = usePathname(); // get the current pathname. usePathname is a custom hook that gives you access to the current pathname.
    const {replace} = useRouter(); // get the replace function from the useRouter hook. useRouter is a built-in Next.js hook that gives you access to the router object.

  const handleSearch = useDebouncedCallback((term)=>{
    
    const params = new URLSearchParams(searchParams); // create a new URLSearchParams object from the searchParams. urlSearchParams is a built-in browser API that allows you to work with query parameters.
    params.set('page', '1'); // set the page parameter to 1 when the search term changes. page is the key for the page number.
    if(term){
      params.set('query', term); // set query parameter to the search term if it exists. query is the key for the search term
    } else {
      params.delete('query'); // delete the query parameter if the search term is empty.
    }
    replace(`${pathname}?${params.toString()}`); // replace the current URL with the new URL that includes the search term. toString() is a built-in method that returns the query parameters as a string.
  },300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}