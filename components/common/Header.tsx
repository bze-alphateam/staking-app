import {
  Box,
  Button,
  Icon,
  Text,
  useTheme,
  useColorModeValue,
} from '@interchain-ui/react';

const stacks = ['Cosmos Kit', 'Next.js'];

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
            paddingX: 0,
          }}
          onClick={toggleColorMode}
        >
          <Icon name={useColorModeValue('moonLine', 'sunLine')} />
        </Button>
      </Box>

      <Box textAlign="center">
        <Text
          as="h1"
          fontWeight="$extrabold"
          fontSize={{ mobile: '$6xl', tablet: '$10xl' }}
          attributes={{
            marginBottom: '$2',
          }}
        >
          BZE Staking
        </Text>
      </Box>
    </>
  );
}
