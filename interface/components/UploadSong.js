import {
    Heading,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Container
} from '@chakra-ui/react';
import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { useContractWrite } from 'wagmi';
import * as Yup from 'yup';
import axios from 'axios';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';
import { SONG_CONTRACT_ADDRESS } from '../shared/constants';

const SongSchema = Yup.object().shape({
    title: Yup.string().required('Required'),
    artist: Yup.string().required('Required'),
    album: Yup.string().required('Required')
});

const pinFileToIPFS = async (data) => {
    console.log('data: ', data);
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    try {
        const resp = await axios.post(url, data, {
            headers: {
                pinata_api_key: '6a09485934c38d2eaa22',
                pinata_secret_api_key:
                    'c66ee0e1a50991957a320035d5037dfa0b59b03317c16659e152724234e1ea2b',
            },
        });
        console.log(resp);
        return resp.data.IpfsHash;
    } catch (error) {
        console.log('error: ', error);
    }
};

const pinJSONToIPFS = async (data) => {
    console.log('data: ', data);
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    try {
        const resp = await axios.post(url, JSON.stringify(data), {
            headers: {
                pinata_api_key: '6a09485934c38d2eaa22',
                pinata_secret_api_key:
                    'c66ee0e1a50991957a320035d5037dfa0b59b03317c16659e152724234e1ea2b',
            },
        });
        console.log(resp);
        return resp.data.IpfsHash;
    } catch (error) {
        console.log('error: ', error);
    }
};

export function UploadSong({address}) {
    const toast = useToast();
    const [cid, setCid] = useState(null);

    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: SONG_CONTRACT_ADDRESS,
        abi: SongABI.abi,
        functionName: 'mintToken',
        onSuccess() {
            toast({
                title: 'Song uploaded correctly!',
                status: 'success',
                duration: 9000,
                containerStyle: {
                    maxHeight: '500px'
                },
                isClosable: true
            });
        },
        onError(error) {
            console.log('error: ', error);
            toast({
                title: 'Error uploading your song',
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

    return (
        <Container>
            <Heading as='h1' size='xl' textAlign='center'>
                Upload your new song
            </Heading>
            <Formik
                initialValues={{
                    title: '',
                    artist: '',
                    album: '',
                    songFile: ''
                }}
                validationSchema={SongSchema}
                onSubmit={(values, actions) => {
                    const { title, artist, album } = values;
                    pinJSONToIPFS({
                        title, artist, album, cid
                    }).then(hash => {
                        write({
                            recklesslySetUnpreparedArgs: [
                                address,
                                hash
                            ]
                        });

                    });
                    actions.setSubmitting(false);
                }}
            >
                {({ errors, touched }) => (
                    <Form >
                        <Container display='flex' flexDirection='column'>

                            <Field name="title">
                                {({ field }) => (
                                    <FormControl mt={4}>
                                        <FormLabel>Song Title</FormLabel>
                                        <Input
                                            {...field}
                                            placeholder='Song Title'
                                        />
                                        {
                                            errors.title
                                            && touched.title
                                            && <span>{errors.title}</span>
                                        }
                                    </FormControl>
                                )}
                            </Field>

                            {/* TODO: IF ENOUGH TIME USE ENS */}
                            <Field name="artist">
                                {({ field }) => (
                                    <FormControl mt={4}>
                                        <FormLabel>Artist</FormLabel>
                                        <Input
                                            {...field}
                                            placeholder='Artist'
                                        />
                                        {
                                            errors.artist
                                            && touched.artist
                                            && <span>{errors.artist}</span>
                                        }
                                    </FormControl>
                                )}
                            </Field>


                            <Field name="album">
                                {({ field }) => (
                                    <FormControl mt={4}>
                                        <FormLabel>Album</FormLabel>
                                        <Input
                                            {...field}
                                            placeholder='Album'
                                        />
                                        {
                                            errors.album
                                            && touched.album
                                            && <span>{errors.album}</span>
                                        }
                                    </FormControl>
                                )}
                            </Field>
                            <input id="file" name="file" type="file" onChange={(event) => {
                                let data = new FormData();
                                data.append('file', event.target.files[0]);
                                data.append('pinataOptions', '{"cidVersion": 1}');
                                pinFileToIPFS(data).then(hash => setCid(`https://ipfs.io/ipfs/${hash}`));
                            }} />
                            <button
                                disabled={touched.title && touched.artist && touched.album && !cid ? true : false}
                                className='primary-button'
                                type="submit"
                                style={{
                                    marginTop: '16px',
                                    cursor:
                                        touched.title && touched.artist && touched.album
                                            && !cid ? 'progress' : 'auto'
                                }}
                            >
                                Submit
                            </button>
                        </Container>

                    </Form>
                )}
            </Formik>
        </Container>
    );
};
