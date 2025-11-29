import {
  Box,
  Button,
  Icon,
  Text,
  useTheme,
  useColorModeValue,
} from '@interchain-ui/react';

export function Header() {
  const { theme, setTheme } = useTheme();

  const toggleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <Box display="flex" justifyContent="end" mb="$8">
        <Button
          intent="secondary"
          size="sm"
          attributes={{
            borderRadius: '$full',
            width: '40px',
            height: '40px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onClick={toggleColorMode}
        >
          <Icon name={useColorModeValue('moonLine', 'sunLine')} />
        </Button>
      </Box>

      {/* Hero Section */}
      <Box
        textAlign="center"
        attributes={{
          py: '$16',
          px: '$4',
          borderRadius: '$2xl',
          background: useColorModeValue(
            'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
          ),
          mb: '$12',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient orbs */}
        <Box
          attributes={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          attributes={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <Box attributes={{ position: 'relative', zIndex: 1 }}>
          <Text
            as="h1"
            fontWeight="$extrabold"
            fontSize={{ mobile: '$6xl', tablet: '$10xl' }}
            attributes={{
              marginBottom: '$4',
            }}
          >
            BZE Staking
          </Text>
          <Text
            fontSize={{ mobile: '$md', tablet: '$xl' }}
            fontWeight="$normal"
            attributes={{
              color: useColorModeValue('$blackAlpha700', '$whiteAlpha700'),
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Stake your BZE tokens and earn rewards on the BeeZee blockchain
          </Text>
        </Box>
      </Box>
    </>
  );
}
