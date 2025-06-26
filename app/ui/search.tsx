'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useSearchParams, useRouter } from 'next/navigation'; //interagir com o URL
import { useDebouncedCallback } from 'use-debounce'

export default function Search({ placeholder }: { placeholder: string }) {

  const searchParams = useSearchParams() //função anônima
  const pathName = usePathname()
  const {replace} = useRouter()

  const handleSearch = useDebouncedCallback((term: string)=>{
    console.log(`searching... ${term}`)

    const params = new URLSearchParams(searchParams); //instanciando o objeto
    if(term){//verificando se está vazio
      params.set('query',term) //se não estiver irá atribui-lo ao URL com o nome "query"
    }else{
      params.delete('query') //se estiver irá remover o parâmetro "query"
    }
    replace(`${pathName}?${params.toString()}`)
  },2000)

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e)=>{ //quando o usuário mudar
          handleSearch(e.target.value)
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
