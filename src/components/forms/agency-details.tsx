'use client'

import { Agency } from "@/generated/prisma/client"
import { initUser } from "@/lib/queries"
import { deleteAgency, upsertAgency } from "@/queries/agency"
import { zodResolver } from "@hookform/resolvers/zod"
import { NumberInput } from '@tremor/react'
import {
  Building2,
  Loader2,
  Mail,
  MapPinned,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { v4 } from "uuid"
import * as z from 'zod'
import FileUpload from "../global/file-upload"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"

interface AgencyDetailsProps {
  data?: Partial<Agency>
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Agency name must be at least 2 characters.' }),
  agencyLogo: z.string().min(1, { message: 'Please upload your agency logo.' }),
  companyEmail: z.email("Enter a valid email address."),
  companyPhone: z.string().min(1, { message: 'Enter a company phone number.' }),
  whiteLabel: z.boolean(),
  address: z.string().min(1, { message: 'Enter a street address.' }),
  city: z.string().min(1, { message: 'Enter a city.' }),
  zipCode: z.string().min(1, { message: 'Enter a postal or ZIP code.' }),
  state: z.string().min(1, { message: 'Enter a state or region.' }),
  country: z.string().min(1, { message: 'Enter a country.' }),
  goal: z
    .number({ error: "Enter a valid number." })
    .int({ message: "Use a whole number." })
    .min(1, { message: "Goal must be at least 1." })
    .max(10_000, { message: "Enter a smaller goal." }),
})

function FormSection({
  step,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: number
  icon: LucideIcon
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section
      id={`agency-step-${step}`}
      className="group scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow duration-200 hover:shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 dark:bg-primary/12 dark:ring-primary/20">
          <Icon className="size-6" strokeWidth={1.65} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/80">
            Step {step} of 4
          </p>
          <h3 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
          {description ? (
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function AgencyDetails({ data }: AgencyDetailsProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      agencyLogo: data?.agencyLogo ?? "",
      companyEmail: data?.companyEmail ?? "",
      companyPhone: data?.companyPhone ?? "",
      whiteLabel: data?.whiteLabel ?? true,
      address: data?.address ?? "",
      city: data?.city ?? "",
      zipCode: data?.zipCode ?? "",
      state: data?.state ?? "",
      country: data?.country ?? "",
      goal: data?.goal ?? 5,
    },
  })

  const isLoading = form.formState.isSubmitting
  const [deletingAgency, setDeletingAgency] = useState(false)

  useEffect(() => {
    if (!data) return
    form.reset({
      name: data.name ?? "",
      agencyLogo: data.agencyLogo ?? "",
      companyEmail: data.companyEmail ?? "",
      companyPhone: data.companyPhone ?? "",
      whiteLabel: data.whiteLabel ?? true,
      address: data.address ?? "",
      city: data.city ?? "",
      zipCode: data.zipCode ?? "",
      state: data.state ?? "",
      country: data.country ?? "",
      goal: data.goal ?? 5,
    })
  }, [data, form])

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData;
      let customerId;

      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          agencyLogo: values.agencyLogo,
          companyPhone: values.companyPhone,
          whiteLabel: values.whiteLabel,
          address: values.address,
          city: values.city,
          zipCode: values.zipCode,
          state: values.state,
          country: values.country,
          goal: values.goal,
        }
      }

      // TODO: customerId
      newUserData = await initUser({
        role: 'AGENCY_OWNER',
      });

      if (!data?.id) {
        const response = await upsertAgency({
          id: data?.id ? data.id : v4(),
          address: values.address,
          agencyLogo: values.agencyLogo,
          city: values.city,
          companyPhone: values.companyPhone,
          country: values.country,
          name: values.name,
          state: values.state,
          whiteLabel: values.whiteLabel,
          zipCode: values.zipCode,
          createdAt: new Date(),
          updatedAt: new Date(),
          companyEmail: values.companyEmail,
          connectedAccountId: "",
          goal: values.goal,
        }, "price_1OpACCFdfEv15JJwACWCyqW2")

        if (!response) {
          toast.error("Oops!", {
            description: "Could not create your agency. Please try again.",
          })
          return
        }

        toast.success("Agency created successfully")
        return router.refresh()
      }
    } catch (error) {
      toast.error("Oops!", {
        description: "Could not create your agency. Please try again.",
      })
      console.log(error)
    }
  }

  const onDeleteAgency = async () => {
    if (!data?.id) return

    setDeletingAgency(true)
    // TODO: discontinue the subscription

    try {
      await deleteAgency(data.id)
      toast.success("Deleted Agency", {
        description: "Deleted your agency and all related subaccounts.",
      });

      router.refresh();
    } catch (error) {
      toast.error("Oppse!", {
        description: "Could not delete your agency. Please try again.",
      });
      console.log(error)
    }

    setDeletingAgency(false)
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-4">
        <Card className="w-full border-border bg-card shadow-md">
          <CardHeader className="border-b border-border pb-8">
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm dark:bg-background/40">
                <Sparkles className="size-3.5 shrink-0" aria-hidden />
                Roughly two minutes · editable anytime
              </div>
              <div className="space-y-2">
                <CardTitle className="font-heading text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Launch your agency workspace
                </CardTitle>
                <CardDescription className="max-w-2xl text-pretty text-base leading-relaxed">
                  A few focused steps—brand, contact, address, and how you plan to grow. Nothing here is permanent;
                  tune it later from agency settings.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="contents"
              noValidate
              aria-label="Create agency"
            >
              <CardContent className="relative space-y-10 pt-8">
                <div className="space-y-8">
                  <FormSection
                    step={1}
                    icon={Building2}
                    title="Brand presence"
                    description="Name and logo are the first things clients and sub-accounts associate with you."
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Northwind Digital"
                              autoComplete="organization"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agencyLogo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency logo</FormLabel>
                          <FormDescription>
                            Square or near-square images read best. Shown in-app and on client-facing surfaces when
                            whitelabel is on.
                          </FormDescription>

                          <div className="rounded-2xl   from-muted/40 to-transparent p-1 dark:from-muted/25">
                            <FormControl>
                              <FileUpload
                                apiEndpoint="agencyLogo"
                                onChange={field.onChange}
                                value={field.value}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormSection>

                  <FormSection
                    step={2}
                    icon={Mail}
                    title="Stay reachable"
                    description="Billing heads-up and account messages go to these channels—keep them ones you monitor."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@company.com"
                                autoComplete="email"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company phone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                autoComplete="tel"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    step={3}
                    icon={MapPinned}
                    title="Where you operate"
                    description="Used where a business address belongs—invoices, compliance, and formal notices."
                  >
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Building, street, suite or unit"
                              autoComplete="street-address"
                              rows={3}
                              className="min-h-[4.5rem] resize-y"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City"
                                autoComplete="address-level2"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal / ZIP code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ZIP or postal code"
                                autoComplete="postal-code"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / region</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State or province"
                                autoComplete="address-level1"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Country"
                                autoComplete="country-name"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    step={4}
                    icon={Rocket}
                    title="Momentum & branding"
                    description="Set a growth target and decide how your brand surfaces for sub-accounts out of the gate."
                  >
                    {!data?.id && (
                      <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-account goal</FormLabel>
                            <FormDescription>
                              How many client workspaces you are planning toward. Adjust anytime as you scale.
                            </FormDescription>
                            <NumberInput
                              value={field.value}
                              onValueChange={(value: number) => {
                                field.onChange(value)
                              }}
                              min={1}
                              disabled={isLoading}
                              className="bg-background !border !border-input px-2 rounded-md"
                              placeholder="Sub Account Goal"
                            />

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="whiteLabel"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between dark:bg-muted/20">
                          <div className="space-y-1.5 pr-0 sm:max-w-[85%] sm:pr-4">
                            <FormLabel className="text-base">Whitelabel agency</FormLabel>
                            <FormDescription className="leading-relaxed">
                              On by default: your logo shows for sub-accounts until you override per account in settings.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                              className="shrink-0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FormSection>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 border-t border-border px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Nothing here is locked in—revisit agency settings whenever your business evolves.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="min-w-[12rem] gap-2 shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/25 sm:shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 opacity-90" aria-hidden />
                      {data?.id ? "Update agency" : "Create agency"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {data?.id && (
          <AlertDialog>
            <Card className="w-full border border-destructive/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Deleting your agency cannot be undone. This will also delete all
                  sub accounts and all data related to your sub accounts. Sub
                  accounts will no longer have access to funnels, contacts etc.
                </CardDescription>
              </CardHeader>

              <CardFooter>
                <AlertDialogTrigger
                  disabled={isLoading || deletingAgency}
                  asChild
                >
                  <div className="flex justify-end w-full">
                    <Button
                      variant="destructive"
                      disabled={isLoading || deletingAgency}
                    >
                      Delete Agency
                    </Button>
                  </div>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      This action cannot be undone. This will permanently delete the
                      Agency account and all related sub accounts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deletingAgency}
                      className="bg-destructive hover:bg-destructive"
                      onClick={onDeleteAgency}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </CardFooter>
            </Card>
          </AlertDialog>
        )}
      </div>

    </div >
  )
}
