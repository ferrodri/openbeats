import {
    Container,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import SwapABI from '../../contracts/artifacts/contracts/Swap.sol/Swap.json';
import SongsABI from '../../contracts/artifacts/contracts/Songs.sol/Songs.json';
import { SONGS_CONTRACT_ADDRESS, SWAP_CONTRACT_ADDRESS, IPFS_BASE_URL, USDC_DECIMALS } from '../shared/constants';
import { useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { ethers, BigNumber } from 'ethers';
import { parseDecimal } from '../shared/utils';


const SaleSchema = Yup.object().shape({
    price: Yup.number().required().positive().integer(),
    tokensNumber: Yup.number().required().positive().integer()
});

const getIPFS = async (url) => {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (error) {
        console.log('error: ', error);
    }
};

export function SongCard({ song }) {
    const { tokenId, numberOfTokens: totalSupply } = song;
    const { isOpen, onClose, onOpen } = useDisclosure();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [hashMetadata, setHashMetadata] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [songUrl, setSongUrl] = useState('');
    const [salePrice, setSalePrice] = useState(0);
    const [saleQuantity, setSaleQuantity] = useState(0);
    const [saleStarted, setSaleStarted] = useState(false);

    const { config } = usePrepareContractWrite({
        address: SONGS_CONTRACT_ADDRESS,
        abi: SongsABI.abi,
        functionName: 'setApprovalForAll',
        args: [SWAP_CONTRACT_ADDRESS, true]
    });
    const { write: setApprovalForAll } = useContractWrite(config);

    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: SWAP_CONTRACT_ADDRESS,
        abi: SwapABI.abi,
        functionName: 'startSale',
        onSuccess() {
            setSaleStarted(true);
            toast({
                title: 'Song tokens listed correctly!',
                status: 'success',
                duration: 9000,
                containerStyle: {
                    maxHeight: '500px'
                },
                isClosable: true
            });
        },
        onError(error) {
            toast({
                title: 'Error listing your song',
                description: (error.message ? error.message : JSON.stringify(error)),
                status: 'error',
                duration: 9000,
                containerStyle: {
                    maxHeight: '500px'
                },
                isClosable: true
            });
        }
    });


    // Read uri
    useContractRead({
        address: SONGS_CONTRACT_ADDRESS,
        abi: SongsABI.abi,
        functionName: 'uri',
        args: [tokenId],
        onSuccess(data) {
            setHashMetadata(data);
            setIsLoading(false);
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        },
        watch: true
    });


    useContractRead({
        address: SWAP_CONTRACT_ADDRESS,
        abi: SwapABI.abi,
        functionName: 'getSalePriceQuantity',
        args: [tokenId],
        watch: true,
        onSuccess(data) {
            const _salePrice = data[0].toNumber();
            const _saleQuantity = data[1].toNumber();
            if (_salePrice && _saleQuantity) {
                setSalePrice(_salePrice);
                setSaleQuantity(_saleQuantity);
            }
            setIsLoading(false);
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        },
        watch: true
    });


    useEffect(() => {

        const getSongIPFS = async (hashMetadata) => {
            const { title, artist, album, cid } = await getIPFS(IPFS_BASE_URL + hashMetadata);
            setTitle(title);
            setArtist(artist);
            setAlbum(album);
            setSongUrl(cid);
        };

        if (hashMetadata) {
            getSongIPFS(hashMetadata);
        }
    }, [hashMetadata]);

    return (
        <>
            {
                error && <span className='error'>
                    Error: {error.message ? error.message : JSON.stringify(error)}
                </span>
            }
            {isLoading && <span>Loading your song ...</span>}
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
                <Text color='#8b949e' fontWeight='bold'>
                    <span style={{ 'color': 'white' }}>Song title: </span>{title}
                </Text>
                <Text color='#8b949e' fontWeight='bold'>
                    <span style={{ 'color': 'white' }}>Song artist: </span>{artist}
                </Text>
                <Text color='#8b949e' fontWeight='bold'>
                    <span style={{ 'color': 'white' }}>Song album: </span>{album}
                </Text>
                <Text color='#8b949e' fontWeight='bold'>
                    <span style={{ 'color': 'white' }}>Tokens total supply: </span>{totalSupply}
                </Text>
                {salePrice && saleQuantity ? <>
                    <Text color='#8b949e' fontWeight='bold'>
                        <span style={{ 'color': 'white' }}>Sale Price: </span>{parseDecimal(salePrice)} USDC
                    </Text>
                </>
                    : !saleStarted ?
                        <button className='primary-button' onClick={onOpen} >
                            Sell song
                        </button>
                        : <></>
                }
                <Modal isOpen={isOpen} onClose={onClose} >
                    <ModalOverlay
                        bg='#211f24'
                        backdropFilter='auto'
                        backdropInvert='80%'
                        backdropBlur='2px'
                    />
                    <ModalContent bg='#211f24' border='white 1px solid'>
                        <ModalHeader>Sale a part of your song</ModalHeader>
                        <ModalCloseButton />
                        <Formik
                            initialValues={{
                                price: null,
                                tokensNumber: null
                            }}
                            validationSchema={SaleSchema}
                            onSubmit={(values, actions) => {
                                const {
                                    price,
                                    tokensNumber
                                } = values;
                                setApprovalForAll();
                                write({
                                    recklesslySetUnpreparedArgs: [
                                        BigNumber.from(tokenId),
                                        ethers.utils.parseUnits(price, USDC_DECIMALS),
                                        BigNumber.from(tokensNumber),
                                    ]
                                });

                                actions.setSubmitting(false);
                                onClose();
                            }}
                        >
                            {({ errors, touched }) => (
                                <Form>
                                    <ModalBody pb={6}>

                                        <Field name="price">
                                            {({ field }) => (
                                                <FormControl mt={4}>
                                                    <FormLabel>Price (USDC)</FormLabel>
                                                    <Input
                                                        {...field}
                                                        placeholder='Price'
                                                    />
                                                    {
                                                        errors.price
                                                        && touched.price
                                                        && <span>{errors.price}</span>
                                                    }
                                                </FormControl>
                                            )}
                                        </Field>


                                        <Field name="tokensNumber">
                                            {({ field }) => (
                                                <FormControl>
                                                    <FormLabel>Number of tokens</FormLabel>
                                                    <Input
                                                        {...field}
                                                        placeholder='Number of tokens'
                                                    />
                                                    {
                                                        errors.tokensNumber
                                                        && touched.tokensNumber
                                                        && <span>{errors.tokensNumber}</span>
                                                    }
                                                </FormControl>
                                            )}
                                        </Field>

                                    </ModalBody>

                                    <ModalFooter>
                                        <button type="submit">Submit</button>
                                    </ModalFooter>
                                </Form>
                            )}
                        </Formik>
                    </ModalContent>
                </Modal>
            </Container>

        </>
    );
};