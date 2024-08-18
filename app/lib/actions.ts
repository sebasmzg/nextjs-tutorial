'use server';

import { sql } from '@vercel/postgres';
import { signIn } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {z} from 'zod';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Customer ID must be a string',
    }),
    amount: z.coerce
        .number()
        .gt(0, {message: 'Please enter an amount greater than $0'}),
    status: z.enum(['pending', 'paid'],{
        invalid_type_error: 'Plese select an invoice status',
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
// Add a closing bracket for the `updateInvoice` function.
}

const CreateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(prevState: State, formData: FormData){
    const validatedFields= CreateInvoice.safeParse( {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success){
        return {
            errors: validatedFields.error.flatten().fieldErrors, //flatten() method flattens the error object into a single level object
            message: 'Missing or invalid fields. Failed to create invoice',
        }
    }

    const {customerId, amount, status} = validatedFields.data;
    const amountInCents = amount*100;
    const date = new Date().toISOString().split('T')[0];
    try{
        await sql`
            INSERT INTO invoices (customer_id, amount,status,date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error){
        return {
            message: 'Database error: Failed to create invoice',
        };
    }

    revalidatePath('/dashboard/invoices'); //revalidatePath is a function that revalidates the cache for a given path. refreshes the page
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({id:true, date: true});

export async function updateInvoice(id:string, prevState: State, formData: FormData){
    const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
    try{
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId},
                amount = ${amountInCents},
                status = ${status}
            WHERE id = ${id}
        `;
    }catch(error){
        return {
            message: 'Database error: Failed to update invoice',
        };
    }

    revalidatePath('/dashboard/invoices'); //revalidatePath is a function that revalidates the cache for a given path. refreshes the page
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id:string){
    //throw new Error('Failed to delete invoice');
    try{
        await sql`
            DELETE FROM invoices
            WHERE id = ${id}
        `;
        revalidatePath('/dashboard/invoices'); 
        return {
            message: 'Invoice deleted successfully',
        }
    } catch (error){
        return {
            message: 'Database error: Failed to delete invoice',
        };
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if(error instanceof AuthError){
            switch(error.type){
                case 'CredentialsSignin':
                    return 'Invalid credentials. Please try again';
                default:
                    return 'Something went wrong. Please try again';
            }
        }
        throw error;
    }
}