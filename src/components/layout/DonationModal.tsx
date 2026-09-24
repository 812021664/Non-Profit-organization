import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import { donorName } from '@/lib/utils';
import { donationService } from '@/services/donationService';

const schema = z.object({
  donorId: z.string().min(1, 'Choose a donor'),
  campaignId: z.string().min(1, 'Choose a campaign'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  date: z.string().min(1, 'Choose a date'),
  status: z.enum(['Completed', 'Pending', 'Failed', 'Refunded']),
  paymentMethod: z.enum(['Card', 'Bank transfer', 'Check', 'Cash', 'Digital wallet']),
  channel: z.enum(['Online', 'Event', 'Direct mail', 'Partner', 'Recurring']),
  recurring: z.boolean(),
  note: z.string().max(240).optional(),
});

type FormValues = z.infer<typeof schema>;

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
}

export function DonationModal({ open, onClose }: DonationModalProps) {
  const donors = useAppStore((state) => state.donors);
  const campaigns = useAppStore((state) => state.campaigns);
  const addDonation = useAppStore((state) => state.addDonation);
  const addToast = useUIStore((state) => state.addToast);
  const dataMode = useUIStore((state) => state.dataMode);
  const setDataMode = useUIStore((state) => state.setDataMode);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'Completed',
      paymentMethod: 'Card',
      channel: 'Online',
      recurring: false,
      date: new Date().toISOString().slice(0, 10),
      amount: 250,
    },
  });

  const close = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const donation = addDonation({ ...values, date: new Date(`${values.date}T12:00:00`).toISOString() });
    const donor = donors.find((item) => item.id === values.donorId);
    if (dataMode === 'connected') {
      try {
        await donationService.save(donation);
      } catch {
        setDataMode('offline');
        addToast({ kind: 'info', title: 'Saved locally; API sync paused', description: 'The donation remains in this browser and will be retried from Settings.' });
      }
    }
    addToast({
      kind: 'success',
      title: 'Donation recorded',
      description: `${donor ? donorName(donor) : 'Donor'} · ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(values.amount)}`,
    });
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Record a donation"
      description="Add a gift to your donor and campaign totals."
      footer={<><Button type="button" variant="ghost" onClick={close}>Cancel</Button><Button type="submit" form="donation-form" loading={form.formState.isSubmitting}>Save donation</Button></>}
    >
      <form id="donation-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
        <Field label="Donor" error={form.formState.errors.donorId?.message} className="sm:col-span-2">
          <Select {...form.register('donorId')}><option value="">Select a donor</option>{donors.map((donor) => <option key={donor.id} value={donor.id}>{donorName(donor)} · {donor.email}</option>)}</Select>
        </Field>
        <Field label="Campaign" error={form.formState.errors.campaignId?.message} className="sm:col-span-2">
          <Select {...form.register('campaignId')}><option value="">Select a campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</Select>
        </Field>
        <Field label="Amount" error={form.formState.errors.amount?.message}>
          <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/35">$</span><Input type="number" min="0" step="0.01" className="pl-7" {...form.register('amount')} /></div>
        </Field>
        <Field label="Date" error={form.formState.errors.date?.message}><Input type="date" {...form.register('date')} /></Field>
        <Field label="Payment method"><Select {...form.register('paymentMethod')}><option>Card</option><option>Bank transfer</option><option>Check</option><option>Cash</option><option>Digital wallet</option></Select></Field>
        <Field label="Channel"><Select {...form.register('channel')}><option>Online</option><option>Event</option><option>Direct mail</option><option>Partner</option><option>Recurring</option></Select></Field>
        <Field label="Status"><Select {...form.register('status')}><option>Completed</option><option>Pending</option><option>Failed</option><option>Refunded</option></Select></Field>
        <Field label="Note" className="sm:col-span-2"><Textarea {...form.register('note')} placeholder="Add a private note about this gift…" /></Field>
        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-emerald-400" {...form.register('recurring')} /><span><span className="block text-sm text-white/75">Recurring gift</span><span className="text-xs text-white/30">Include this donation in recurring giving reports.</span></span></label>
      </form>
    </Modal>
  );
}
