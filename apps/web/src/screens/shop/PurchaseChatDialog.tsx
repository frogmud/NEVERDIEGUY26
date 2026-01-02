/**
 * Purchase Chat Dialog - NPC Vendor Dialogue for Purchases
 *
 * When purchasing an item, opens a chat with the vendor NPC.
 * Vendor can accept, negotiate, upsell, or give item free based on mood.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  LocalOfferSharp as OfferIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { getPersonality, getTemplatesForNPC } from '../../data/npc-chat/npcs';
import { deriveMood, getMoodEffects, createDefaultRelationship } from '../../data/npc-chat/relationship';
import type { Item, Shop, InventoryItem } from '../../data/wiki/types';
import type { MoodType, MoodGameplayEffects } from '../../data/npc-chat/types';

interface PurchaseChatDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item;
  shop: Shop;
  inventoryEntry: InventoryItem;
  onPurchaseComplete: (success: boolean, finalPrice: number) => void;
}

type ChatPhase = 'greeting' | 'negotiating' | 'complete';
type PurchaseOutcome = 'accepted' | 'discounted' | 'gifted' | 'declined' | null;

interface ChatMessage {
  id: string;
  sender: 'player' | 'npc';
  text: string;
  timestamp: number;
}

// Vendor dialogue generators based on mood and outcome
function getVendorGreeting(
  npcName: string,
  itemName: string,
  price: number,
  mood: MoodType,
  moodEffects: MoodGameplayEffects
): string {
  const modifiedPrice = Math.round(price * moodEffects.priceModifier);

  const greetings: Record<MoodType, string[]> = {
    generous: [
      `${itemName}? Excellent choice! For you, I can do ${modifiedPrice}g. What do you say?`,
      `Ah, the ${itemName}! I've been saving this one. ${modifiedPrice}g and it's yours!`,
      `You've got good taste! Tell you what - ${modifiedPrice}g and we have a deal.`,
    ],
    pleased: [
      `The ${itemName}! That'll be ${price}g. Fair price for quality goods!`,
      `Interested in the ${itemName}? ${price}g and it's all yours!`,
      `${itemName}, excellent selection! ${price}g - shall I wrap it up?`,
    ],
    neutral: [
      `${itemName}. ${price} gold.`,
      `That's ${price}g for the ${itemName}. Take it or leave it.`,
      `${itemName} is ${price} gold. Interested?`,
    ],
    amused: [
      `Oho! The ${itemName} caught your eye? ${price}g, but I sense you want to haggle!`,
      `${itemName}! Everyone wants one. ${price}g... unless you have a better offer?`,
      `Ah, excellent eye! ${price}g for the ${itemName}. Though I do enjoy a good negotiation...`,
    ],
    cryptic: [
      `The ${itemName} chooses its owner... ${price}g reveals if you are worthy.`,
      `Fate led you to this ${itemName}. ${price} gold is but a symbol of commitment.`,
      `${price}g. The ${itemName} has been waiting for you. Or perhaps... you for it?`,
    ],
    annoyed: [
      `${itemName}. ${price}g. I don't have all day.`,
      `That's ${price} gold. You want it or not?`,
      `*sigh* ${itemName}, ${price}g. Final offer.`,
    ],
    threatening: [
      `${itemName}. ${price}g. And don't even think about running off with it.`,
      `That'll be ${price} gold. Pay up or get out.`,
      `${price}g for the ${itemName}. Take it. Now.`,
    ],
  };

  const options = greetings[mood] || greetings.neutral;
  return options[Math.floor(Math.random() * options.length)];
}

function getVendorResponse(
  outcome: PurchaseOutcome,
  mood: MoodType,
  itemName: string,
  finalPrice: number
): string {
  if (outcome === 'accepted') {
    const responses: Record<MoodType, string[]> = {
      generous: [
        `Wonderful! A pleasure doing business with you. Enjoy the ${itemName}!`,
        `Deal! May it serve you well. Come back anytime!`,
        `Sold! You won't regret this purchase!`,
      ],
      pleased: [
        `Excellent! The ${itemName} is yours. Thank you for your business!`,
        `Done! Take good care of it!`,
        `A fine purchase! Pleasure doing business!`,
      ],
      neutral: [
        `Transaction complete. Next.`,
        `Done. The ${itemName} is yours.`,
        `Sold.`,
      ],
      amused: [
        `Ha! A fair deal! The ${itemName} is yours!`,
        `And just like that - sold! I love a decisive customer!`,
        `Deal! You drive a hard bargain... just kidding!`,
      ],
      cryptic: [
        `The exchange is made. May the ${itemName} guide your path.`,
        `So it is done. The ${itemName} has found its purpose.`,
        `The transaction completes a prophecy long foretold...`,
      ],
      annoyed: [
        `Fine. Take it. Next!`,
        `About time. It's yours.`,
        `Finally. Move along.`,
      ],
      threatening: [
        `Smart choice. Now get out of my sight.`,
        `Good. Don't come back unless you're buying.`,
        `Done. Leave.`,
      ],
    };
    const options = responses[mood] || responses.neutral;
    return options[Math.floor(Math.random() * options.length)];
  }

  if (outcome === 'discounted') {
    const responses: Record<MoodType, string[]> = {
      generous: [
        `You know what? ${finalPrice}g. Friends and family discount!`,
        `Alright, alright! ${finalPrice}g - but don't tell anyone!`,
        `For you? ${finalPrice}g. Consider it a special price.`,
      ],
      pleased: [
        `Hmm... I can do ${finalPrice}g. Final offer!`,
        `Tell you what - ${finalPrice}g. Deal?`,
        `${finalPrice}g, but that's as low as I go!`,
      ],
      neutral: [
        `${finalPrice}g. Take it.`,
        `Fine. ${finalPrice}g. That's my final offer.`,
        `${finalPrice}g or nothing.`,
      ],
      amused: [
        `Ha! I like your style! ${finalPrice}g it is!`,
        `You're a tough one! ${finalPrice}g - you earned that discount!`,
        `*laughs* Fine, fine! ${finalPrice}g!`,
      ],
      cryptic: [
        `The stars align at ${finalPrice}g... your destiny approaches.`,
        `${finalPrice} gold... the universe has spoken.`,
        `A sign from beyond... ${finalPrice}g feels right.`,
      ],
      annoyed: [
        `Ugh, fine! ${finalPrice}g! Happy now?`,
        `${finalPrice}g. Just take it already.`,
        `*grumbles* ${finalPrice}g. Now stop wasting my time.`,
      ],
      threatening: [
        `${finalPrice}g. Don't push your luck.`,
        `Fine. ${finalPrice}g. But try that again and we're done.`,
        `${finalPrice}g. Last chance.`,
      ],
    };
    const options = responses[mood] || responses.neutral;
    return options[Math.floor(Math.random() * options.length)];
  }

  if (outcome === 'gifted') {
    return [
      `You know what? Take it. Consider it a gift from a friend.`,
      `Keep your gold. This one's on the house!`,
      `Free of charge! Just remember me next time you're loaded!`,
      `No payment needed. You've earned this one.`,
      `Take it! Consider it an investment in our relationship!`,
    ][Math.floor(Math.random() * 5)];
  }

  // declined
  return [
    `Maybe next time, then.`,
    `No worries. I'll be here if you change your mind.`,
    `Your loss! This won't last forever...`,
    `Fair enough. Come back when you're ready.`,
    `Alright. The ${itemName} will wait.`,
  ][Math.floor(Math.random() * 5)];
}

export function PurchaseChatDialog({
  open,
  onClose,
  item,
  shop,
  inventoryEntry,
  onPurchaseComplete,
}: PurchaseChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<ChatPhase>('greeting');
  const [outcome, setOutcome] = useState<PurchaseOutcome>(null);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [vendorMood, setVendorMood] = useState<MoodType>('neutral');
  const [moodEffects, setMoodEffects] = useState<MoodGameplayEffects | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const basePrice = typeof inventoryEntry.price === 'number' ? inventoryEntry.price : 0;

  // Get vendor NPC info
  const vendorSlug = shop.proprietor || shop.slug;
  const personality = getPersonality(vendorSlug);
  const vendorName = personality?.name || shop.name;

  // Initialize chat when dialog opens
  useEffect(() => {
    if (open) {
      // Reset state
      setMessages([]);
      setPhase('greeting');
      setOutcome(null);
      setFinalPrice(basePrice);

      // Derive mood from relationship
      const relationship = createDefaultRelationship(vendorSlug);
      const context = {
        runSeed: `purchase-${Date.now()}`,
        roomIndex: 1,
        currentDomain: shop.location || 'the-dying-saucer',
        playerGold: 1000, // Could be passed in
        playerIntegrity: 100,
        playerLuckyNumber: 7,
        heat: 0,
      };

      const mood = deriveMood(relationship, context);
      const effects = getMoodEffects(mood);

      setVendorMood(mood);
      setMoodEffects(effects);
      setFinalPrice(Math.round(basePrice * effects.priceModifier));

      // Add greeting message after a short delay
      setIsTyping(true);
      setTimeout(() => {
        const greeting = getVendorGreeting(vendorName, item.name, basePrice, mood, effects);
        setMessages([
          {
            id: `msg-${Date.now()}`,
            sender: 'npc',
            text: greeting,
            timestamp: Date.now(),
          },
        ]);
        setIsTyping(false);
      }, 600);
    }
  }, [open, vendorSlug, vendorName, item.name, basePrice, shop.location]);

  const addMessage = useCallback((sender: 'player' | 'npc', text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender,
        text,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleAccept = () => {
    addMessage('player', `Deal! Here's ${finalPrice}g.`);
    setIsTyping(true);

    setTimeout(() => {
      setOutcome('accepted');
      addMessage('npc', getVendorResponse('accepted', vendorMood, item.name, finalPrice));
      setPhase('complete');
      setIsTyping(false);
      onPurchaseComplete(true, finalPrice);
    }, 800);
  };

  const handleNegotiate = () => {
    if (!moodEffects) return;

    addMessage('player', `How about a discount?`);
    setIsTyping(true);

    setTimeout(() => {
      // Check if vendor will give discount based on mood
      const willDiscount = Math.random() < moodEffects.specialOfferChance + 0.3;
      const willGift = moodEffects.priceModifier < 0.8 && Math.random() < 0.15;

      if (willGift) {
        setOutcome('gifted');
        setFinalPrice(0);
        addMessage('npc', getVendorResponse('gifted', vendorMood, item.name, 0));
        setPhase('complete');
        onPurchaseComplete(true, 0);
      } else if (willDiscount) {
        const discountedPrice = Math.round(finalPrice * 0.85);
        setOutcome('discounted');
        setFinalPrice(discountedPrice);
        addMessage('npc', getVendorResponse('discounted', vendorMood, item.name, discountedPrice));
        setPhase('negotiating');
      } else {
        // Vendor refuses discount
        addMessage('npc', [
          `Sorry, that's my best price.`,
          `No can do. ${finalPrice}g is fair.`,
          `I've got to make a living too! ${finalPrice}g, take it or leave it.`,
          `My prices are already competitive!`,
        ][Math.floor(Math.random() * 4)]);
        setPhase('negotiating');
      }
      setIsTyping(false);
    }, 800);
  };

  const handleDecline = () => {
    addMessage('player', `Maybe another time.`);
    setIsTyping(true);

    setTimeout(() => {
      setOutcome('declined');
      addMessage('npc', getVendorResponse('declined', vendorMood, item.name, 0));
      setPhase('complete');
      setIsTyping(false);
      onPurchaseComplete(false, 0);
    }, 600);
  };

  const handleClose = () => {
    if (phase !== 'complete' && outcome === null) {
      onPurchaseComplete(false, 0);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          borderRadius: '24px',
          maxHeight: '80vh',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Avatar
          src={shop.portrait}
          alt={vendorName}
          sx={{
            width: 48,
            height: 48,
            border: `2px solid ${tokens.colors.secondary}`,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
            {vendorName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
            {shop.name}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Item being purchased */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: tokens.colors.background.default,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Box
          component="img"
          src={item.image || `/assets/items/${item.itemType?.toLowerCase() || 'misc'}/${item.slug}.png`}
          alt={item.name}
          sx={{
            width: 48,
            height: 48,
            imageRendering: 'pixelated',
            objectFit: 'contain',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {item.name}
          </Typography>
          <Chip
            label={item.rarity}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: `${RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary}25`,
              color: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || tokens.colors.text.primary,
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: tokens.colors.warning,
              fontFamily: tokens.fonts.gaming,
            }}
          >
            {finalPrice}g
          </Typography>
          {finalPrice !== basePrice && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: tokens.colors.text.disabled,
                textDecoration: 'line-through',
              }}
            >
              {basePrice}g
            </Typography>
          )}
        </Box>
      </Box>

      {/* Chat messages */}
      <DialogContent sx={{ p: 2, minHeight: 200 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'player' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor:
                    msg.sender === 'player'
                      ? tokens.colors.secondary
                      : tokens.colors.background.elevated,
                  color: msg.sender === 'player' ? '#000' : tokens.colors.text.primary,
                }}
              >
                <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {msg.text}
                </Typography>
              </Box>
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: tokens.colors.background.elevated,
                }}
              >
                <Typography sx={{ fontSize: '0.9rem', color: tokens.colors.text.secondary }}>
                  ...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Quick reply buttons */}
      {phase !== 'complete' && !isTyping && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 2,
            borderTop: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Button
            variant="contained"
            onClick={handleAccept}
            sx={{
              flex: 1,
              bgcolor: tokens.colors.success,
              color: '#000',
              fontWeight: 600,
              borderRadius: '12px',
              '&:hover': { bgcolor: tokens.colors.success, opacity: 0.9 },
            }}
          >
            {outcome === 'discounted' || outcome === 'gifted'
              ? 'Accept Deal'
              : `Pay ${finalPrice}g`}
          </Button>
          {phase === 'greeting' && (
            <Button
              variant="outlined"
              onClick={handleNegotiate}
              startIcon={<OfferIcon />}
              sx={{
                flex: 1,
                borderColor: tokens.colors.secondary,
                color: tokens.colors.secondary,
                fontWeight: 600,
                borderRadius: '12px',
                '&:hover': {
                  borderColor: tokens.colors.secondary,
                  bgcolor: `${tokens.colors.secondary}15`,
                },
              }}
            >
              Negotiate
            </Button>
          )}
          <Button
            variant="text"
            onClick={handleDecline}
            sx={{
              color: tokens.colors.text.secondary,
              fontWeight: 600,
              borderRadius: '12px',
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            Decline
          </Button>
        </Box>
      )}

      {/* Complete state - close button */}
      {phase === 'complete' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            borderTop: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              px: 4,
              bgcolor: tokens.colors.secondary,
              color: '#000',
              fontWeight: 600,
              borderRadius: '12px',
              '&:hover': { bgcolor: tokens.colors.secondary, opacity: 0.9 },
            }}
          >
            {outcome === 'accepted' || outcome === 'discounted' || outcome === 'gifted'
              ? 'Done'
              : 'Close'}
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
