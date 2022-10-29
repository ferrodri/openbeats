import {
    Heading,
    FormControl,
    FormLabel,
    Input,
    Container
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useBlockNumber, useProvider } from 'wagmi';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';
import { SONG_CONTRACT_ADDRESS } from '../shared/constants';
import { ethers } from 'ethers';
import { DeployFractionSong } from './DeployFractionSong';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';

const SongSchema = Yup.object().shape({
    numberOfTokens: Yup.number().required().positive().integer()
});

export function FractionSong() {
    const provider = useProvider();
    const { data: blockNumber } = useBlockNumber();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [tokenId, setTokenId] = useState(null);
    const [tokensNumber, setTokensNumber] = useState(null);

    useEffect(() => {
        const songContract = new ethers.Contract(
            SONG_CONTRACT_ADDRESS, SongABI.abi, provider
        );
        let eventFilter = songContract.filters.Transfer();

        provider.getLogs({
            ...eventFilter,
            fromBlock: blockNumber - 1,
            toBlock: 'latest'
        }).then(logs => {
            const _log = logs[logs.length - 1];
            const log = songContract.interface.parseLog(_log).args[2].toNumber();
            setTokenId(log);
            setIsLoading(false);
        }).catch(error => {
            setIsLoading(false);
            setError(error);
        });
    }, [blockNumber, provider]);

    return (
        <Container>
            {
                error && <span className='error'>
                    Error: {error.message ? error.message : JSON.stringify(error)}
                </span>
            }
            {isLoading && <span>Loading your song ...</span>}
            {/* TODO frh render song here with title, artist and so on */}
            {tokenId && !tokensNumber && <>
                <Heading as='h1' size='xl' textAlign='center'>
                    How many tokens should your song have?
                </Heading>
                <Formik
                    initialValues={{
                        numberOfTokens: null,
                    }}
                    validationSchema={SongSchema}
                    onSubmit={(values, actions) => {
                        const { numberOfTokens } = values;
                        setTokensNumber(numberOfTokens);
                        actions.setSubmitting(false);
                    }}
                >
                    {({ errors, touched }) => (
                        <Form >
                            <Container display='flex' flexDirection='column'>

                                <Field name="numberOfTokens">
                                    {({ field }) => (
                                        <FormControl mt={4}>
                                            <FormLabel>Number of tokens</FormLabel>
                                            <Input
                                                {...field}
                                                placeholder='Number of tokens'
                                            />
                                            {
                                                errors.numberOfTokens
                                                && touched.numberOfTokens
                                                && <span>{errors.numberOfTokens}</span>
                                            }
                                        </FormControl>
                                    )}
                                </Field>
                                <button
                                    disabled={touched.title && touched.artist && touched.album && !cid ? true : false}
                                    className='primary-button'
                                    type="submit"
                                    style={{
                                        marginTop: '16px',
                                        cursor:
                                            touched.title && touched.artist && touched.album
                                                && !cid ? 'progress' : 'pointer'
                                    }}
                                >
                                    Submit
                                </button>
                            </Container>

                        </Form>
                    )}
                </Formik>
            </>}
            {tokensNumber &&  <DeployFractionSong tokensNumber={tokensNumber} tokenId={tokenId}/> }
        </Container>
    );
};