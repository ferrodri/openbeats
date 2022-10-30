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
import SwapABI from '../../contracts/artifacts/contracts/Swap.sol/Swap.json';
import SongsABI from '../../contracts/artifacts/contracts/Songs.sol/Songs.json';
import { SONGS_CONTRACT_ADDRESS, SWAP_CONTRACT_ADDRESS, IPFS_BASE_URL, USDC_DECIMALS, USDC_CONTRACT_ADDRESS } from '../shared/constants';
import ERC20ABI from '../shared/ERC20.json';
import { useContractRead, useContractWrite } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseDecimal } from '../shared/utils';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { ethers, BigNumber } from 'ethers';

const SaleSchema = Yup.object().shape({
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

export function SongCardBuy({ tokenId }) {
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

    const { write: transfer } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: USDC_CONTRACT_ADDRESS,
        abi: ERC20ABI.abi,
        functionName: 'transfer'
    });


    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: SWAP_CONTRACT_ADDRESS,
        abi: SwapABI.abi,
        functionName: 'buy',
        onSettled() {
            setTimeout(
                toast({
                    title: 'Song tokens bought correctly!',
                    status: 'success',
                    duration: 9000,
                    containerStyle: {
                        maxHeight: '500px'
                    },
                    isClosable: true
                }),
                2000);
        },
        onError(error) {
            console.log('error: ', error);
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
            console.log('_saleQuantity: ', _saleQuantity);
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
                {salePrice && saleQuantity ? <>
                    <Text color='#8b949e' fontWeight='bold'>
                        <span style={{ 'color': 'white' }}>Sale Price: </span>{parseDecimal(salePrice)} USDC
                    </Text>
                    <Modal isOpen={isOpen} onClose={onClose} >
                        <ModalOverlay
                            bg='#211f24'
                            backdropFilter='auto'
                            backdropInvert='80%'
                            backdropBlur='2px'
                        />
                        <ModalContent bg='#211f24' border='white 1px solid'>
                            <ModalHeader>Buy for {parseDecimal(salePrice)} USDC per token</ModalHeader>
                            <ModalCloseButton />
                            <Formik
                                initialValues={{
                                    tokensNumber: null
                                }}
                                validationSchema={SaleSchema}
                                onSubmit={(values, actions) => {
                                    const {
                                        tokensNumber
                                    } = values;
                                    // Sale price already parsed to usdc
                                    const total = salePrice * tokensNumber;
                                    transfer({
                                        recklesslySetUnpreparedArgs: [
                                            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                                            total
                                        ]
                                    });

                                    write({
                                        recklesslySetUnpreparedArgs: [
                                            BigNumber.from(tokenId),
                                            '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                                            BigNumber.from(salePrice),
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
                    <button className='primary-button' onClick={() => onOpen()} >
                        Buy song
                    </button>
                </> : <></>}
            </Container>

        </>
    );
};