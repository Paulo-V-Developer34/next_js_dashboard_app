"use server"

import {z} from 'zod'
import postgres from 'postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

//connectando com o banco de dados
const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'})

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({id: true, date: true})

export async function createInvoice(formData: FormData){
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    const amountInCents = amount * 100 //é uma boa prática mantermos valores monetásrios em centavos para evitarmos problemas de imprecisão de valores flutuantes
    const date = new Date().toISOString().split('T')[0] //estamos criando os dados que ainda não foram inseridos pelo usuário pois podem ser colocados automaticamente pelo sistema

    //fazendo a consulta
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `

    //recarregando cache da página a qual iremos redirecionar o usuário
    revalidatePath('/dashboard/invoices')
    //redirecionando o usuário
    redirect('/dashboard/invoices')
}

const UpdateInvoice = FormSchema.omit({id: true, date: true})

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `
  } catch(err){
    console.error(err)
  }
 
  revalidatePath('/dashboard/invoices');//note que é muito importante revalidarmos o cacho do cliente
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string){
    throw new Error('failed to delete invoice')

    //esse comando não será utilizado enquanto estivermos testando os erros
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}