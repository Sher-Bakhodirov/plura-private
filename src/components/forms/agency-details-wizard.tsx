'use client'

import { Agency } from "@/generated/prisma/client"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MapPinned,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useForm } from "react-hook-form"
import * as z from 'zod'
import FileUpload from "../global/file-upload"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"

interface AgencyDetailsWizardProps {
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

type FormValues = z.infer<typeof FormSchema>
type StepField = keyof FormValues

const STEPS: {
  label: string
  icon: LucideIcon
  title: string
  description: string
  fields: StepField[]
}[] = [
  {
    label: "Brand",
    icon: Building2,
    title: "Brand presence",
    description: "Name and logo are the first things clients and sub-accounts associate with you.",
    fields: ["name", "agencyLogo"],
  },
  {
    label: "Contact",
    icon: Mail,
    title: "Stay reachable",
    description: "Billing heads-up and account messages go to these channels—keep them ones you monitor.",
    fields: ["companyEmail", "companyPhone"],
  },
  {
    label: "Location",
    icon: MapPinned,
    title: "Where you operate",
    description: "Used where a business address belongs—invoices, compliance, and formal notices.",
    fields: ["address", "city", "zipCode", "state", "country"],
  },
  {
    label: "Growth",
    icon: Rocket,
    title: "Momentum & branding",
    description: "Set a growth target and decide how your brand surfaces for sub-accounts out of the gate.",
    fields: ["goal", "whiteLabel"],
  },
]

const TOTAL_STEPS = STEPS.length

function StepIndicator({
  currentStep,
  completedUpTo,
}: {
  currentStep: number
  completedUpTo: number
}) {
  return (
    <nav aria-label="Form steps" className="rounded-2xl border border-dashed border-primary/20 bg-muted/25 p-4 dark:bg-muted/15">
      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Step {currentStep + 1} of {TOTAL_STEPS}
      </p>
      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep
          const isDone = idx < completedUpTo
          return (
            <li key={idx}>
              <div
                className={`flex flex-col gap-2 rounded-xl border px-3 py-2.5 transition-all ${
                  isActive
                    ? "border-primary/40 bg-background/80 shadow-sm dark:bg-background/40"
                    : isDone
                    ? "border-primary/20 bg-background/40 dark:bg-background/20"
                    : "border-transparent bg-background/25 dark:bg-background/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums transition-colors ${
                      isDone
                        ? "bg-primary/20 text-primary"
                        : isActive
                        ? "bg-gradient-to-br from-primary/25 to-primary/5 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="size-4" /> : idx + 1}
                  </span>
                  <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </span>
                <span className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-chart-2 opacity-80 transition-all duration-500"
                    style={{ width: isDone ? "100%" : isActive ? "50%" : "0%" }}
                  />
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function FormSection({
  icon: Icon,
  title,
  description,
  stepNumber,
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  stepNumber: number
  children: ReactNode
}) {
  return (
    <section className="group relative scroll-mt-24 rounded-2xl border border-border/80 bg-gradient-to-br from-muted/35 via-card/50 to-primary/[0.06] p-5 shadow-sm sm:p-6 dark:from-muted/20 dark:via-card/40 dark:to-primary/[0.09]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner ring-1 ring-primary/15 dark:from-primary/25 dark:to-primary/10">
          <Icon className="size-6" strokeWidth={1.65} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/80">
            Step {stepNumber} of {TOTAL_STEPS}
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

export default function AgencyDetailsWizard({ data }: AgencyDetailsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedUpTo, setCompletedUpTo] = useState(0)

  const form = useForm<FormValues>({
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
  const isLastStep = currentStep === TOTAL_STEPS - 1

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

  const onSubmit = async (values: FormValues) => {
    void values
  }

  const goNext = async () => {
    const fields = STEPS[currentStep].fields
    const valid = await form.trigger(fields)
    if (!valid) return
    const next = currentStep + 1
    setCurrentStep(next)
    if (next > completedUpTo) setCompletedUpTo(next)
  }

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const step = STEPS[currentStep]

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -left-40 top-0 hidden size-[min(32rem,90vw)] rounded-full bg-primary/[0.12] blur-3xl lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 hidden size-[min(26rem,80vw)] rounded-full bg-chart-2/[0.15] blur-3xl lg:block"
        aria-hidden
      />

      <Card className="relative w-full overflow-hidden border-primary/20 bg-card/95 shadow-xl ring-1 ring-primary/5 backdrop-blur-[1px] dark:bg-card/90">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.5 0.02 250 / 0.09) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />

        <CardHeader className="relative border-b border-primary/10 pb-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_0%_-20%,var(--color-primary),transparent_50%)] opacity-[0.14] dark:opacity-[0.2]"
            aria-hidden
          />
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
            <CardContent className="relative space-y-8 pt-8">
              <StepIndicator currentStep={currentStep} completedUpTo={completedUpTo} />

              <div className="min-h-0">
                <FormSection
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  stepNumber={currentStep + 1}
                >
                  {currentStep === 0 && (
                    <>
                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Northwind Digital"
                                autoComplete="organization"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="agencyLogo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agency logo</FormLabel>
                            <FormDescription>
                              Square or near-square images read best. Shown in-app and on client-facing surfaces when
                              whitelabel is on.
                            </FormDescription>
                            <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-b from-muted/40 to-transparent p-1 dark:from-muted/25">
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
                    </>
                  )}

                  {currentStep === 1 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        disabled={isLoading}
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
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        disabled={isLoading}
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
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <>
                      <FormField
                        disabled={isLoading}
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
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City"
                                  autoComplete="address-level2"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal / ZIP code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ZIP or postal code"
                                  autoComplete="postal-code"
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
                          disabled={isLoading}
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State / region</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="State or province"
                                  autoComplete="address-level1"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Country"
                                  autoComplete="country-name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-account goal</FormLabel>
                            <FormDescription>
                              How many client workspaces you are planning toward. Adjust anytime as you scale.
                            </FormDescription>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10_000}
                                step={1}
                                inputMode="numeric"
                                {...field}
                                value={field.value}
                                onChange={(e) => {
                                  const n = e.target.valueAsNumber
                                  field.onChange(Number.isFinite(n) ? n : 0)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="whiteLabel"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-muted/20 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between dark:from-primary/[0.1] dark:via-muted/10">
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
                                className="shrink-0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </FormSection>
              </div>
            </CardContent>

            <CardFooter className="relative flex flex-col gap-4 border-t border-primary/10 bg-gradient-to-r from-muted/40 via-card to-primary/[0.04] px-6 py-6 sm:flex-row sm:items-center sm:justify-between dark:from-muted/25 dark:via-card dark:to-primary/[0.06]">
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Nothing here is locked in—revisit agency settings whenever your business evolves.
              </p>

              <div className="flex items-center gap-3 sm:shrink-0">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={goBack}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </Button>
                )}

                {!isLastStep ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={goNext}
                    disabled={isLoading}
                    className="min-w-[10rem] gap-2 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
                  >
                    Continue
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="min-w-[12rem] gap-2 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 opacity-90" aria-hidden />
                        Create agency
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
