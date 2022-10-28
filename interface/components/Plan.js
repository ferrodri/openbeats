import { Container, Heading, Image, Text } from '@chakra-ui/react';

export function Plan({ plan }) {
    const { heading, img, price, hours } = plan;

    return (
        <Container
            w='100%'
            h='100%'
            border='1px solid #2d2d2d'
            margin='12px'
            padding='24px'
            borderRadius='12px'
            display='flex'
            flexDirection='column'
        >
            <Heading as='h2' fontSize='22px' marginBottom='16px' textAlign='center'>
                {heading}
            </Heading>
            <Image src={img} alt={heading} width='82px' margin='auto' />
            <Text textAlign='center' marginTop='16px'><b>{hours} hours of music</b></Text>
            <Text textAlign='center' color='#8b949e'><b>{price}</b></Text>
            <button
                className='primary-button'
                style={{
                    width: '100px',
                    margin: '12px auto 0 auto'
                }}
            >Select</button>
        </Container>
    );
}