'use client'
import { Agency } from "@/generated/prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from 'zod'
import { AlertDialog } from "../ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form"

interface AgencyDetailsProps {
  data?: Partial<Agency>
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Agency name must be at least 2 chars' }),
  agencyLogo: z.string().min(1),
  companyEmail: z.email(),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  goal: z.number().min(1),
})

export default function AgencyDetails({ data }: AgencyDetailsProps) {
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState();
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      agencyLogo: data?.agencyLogo,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      goal: data?.goal,
    }
  })

  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data])

  const onSubmit = async () => { }

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for your business. You can edit agency settings later from the agency settings tab.
          </CardDescription>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField disabled={isLoading} control={form.control} name="agencyLogo" render={(field) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>

                    </FormControl>
                  </FormItem>
                )}></FormField>

              </form>
            </Form>
          </CardContent>
        </CardHeader>
      </Card>
    </AlertDialog >
  )

  return (
    <div>Agency Details</div>
  )
}