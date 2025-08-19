"use server"

import {z} from 'zod'
import postgres from 'postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

//connectando com o banco de dados
const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'})

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({id: true, date: true})

export async function createInvoice(prevState: State,formData: FormData){//adicionando prevState
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })

    //tratando os erros
    if(!validatedFields.success){
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing fields. Failed to create invoice!'
      }
    }

    const { customerId, amount, status } = validatedFields.data;

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

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  //tratando os erros
    if(!validatedFields.success){
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing fields. Failed to create invoice!'
      }
    }

  const { customerId, amount, status } = validatedFields.data
 
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