import {
  Box,
  Typography,
  Container,
  Button,
  Divider,
} from '@mui/material';
import {
  CheckCircleSharp as CheckIcon,
  ReceiptSharp as ReceiptIcon,
  DownloadSharp as DownloadIcon,
  ShareSharp as ShareIcon,
  MonetizationOnSharp as GoldIcon,
  CreditCardSharp as CardIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';

// Mock receipt data
const receiptData = {
  orderId: 'NDG-2024-1222-8472',
  date: 'December 22, 2024 at 3:45 PM',
  items: [
    { name: '2,800 Gold Bundle', quantity: 1, price: '$19.99' },
    { name: 'Bonus Gold', quantity: 800, price: 'FREE' },
  ],
  subtotal: '$19.99',
  tax: '$1.60',
  total: '$21.59',
  paymentMethod: 'Visa ending in 4242',
  goldReceived: 3600,
};

export function Receipt() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: `${tokens.colors.success}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <CheckIcon sx={{ fontSize: 40, color: tokens.colors.success }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Purchase Complete!
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <GoldIcon sx={{ color: tokens.colors.warning }} />
          <Typography variant="h6" sx={{ color: tokens.colors.warning, fontWeight: 700 }}>
            +{receiptData.goldReceived.toLocaleString()} Gold
          </Typography>
        </Box>
      </Box>

      {/* Receipt Card */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        {/* Receipt Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: tokens.colors.background.elevated,
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ReceiptIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography variant="subtitle2" sx={{ color: tokens.colors.text.secondary }}>
              Receipt
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {receiptData.orderId}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
            {receiptData.date}
          </Typography>
        </Box>

        {/* Items */}
        <Box sx={{ p: 3 }}>
          {receiptData.items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box>
                <Typography variant="body2">{item.name}</Typography>
                {item.quantity > 1 && (
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    x{item.quantity}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: item.price === 'FREE' ? tokens.colors.success : 'inherit',
                  fontWeight: item.price === 'FREE' ? 600 : 400,
                }}
              >
                {item.price}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              Subtotal
            </Typography>
            <Typography variant="body2">{receiptData.subtotal}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              Tax
            </Typography>
            <Typography variant="body2">{receiptData.tax}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Total
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {receiptData.total}
            </Typography>
          </Box>
        </Box>

        {/* Payment Method */}
        <Box
          sx={{
            p: 3,
            bgcolor: tokens.colors.background.elevated,
            borderTop: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CardIcon sx={{ fontSize: 20, color: tokens.colors.text.secondary }} />
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              {receiptData.paymentMethod}
            </Typography>
          </Box>
        </Box>
      </CardSection>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" fullWidth startIcon={<DownloadIcon />}>
          Download PDF
        </Button>
        <Button variant="outlined" fullWidth startIcon={<ShareIcon />}>
          Email Receipt
        </Button>
      </Box>

      {/* Continue Button */}
      <Button variant="contained" fullWidth size="large" href="/shop">
        Continue Shopping
      </Button>

      {/* Help Text */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 3,
          color: tokens.colors.text.disabled,
        }}
      >
        Questions? Contact support@neverdieguy.com
      </Typography>
    </Container>
  );
}
