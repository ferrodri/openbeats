import { Container, Grid, GridItem, Heading, Text } from '@chakra-ui/react';
import SongsABI from '../../contracts/artifacts/contracts/Songs.sol/Songs.json';
import { SONGS_CONTRACT_ADDRESS, IPFS_BASE_URL } from '../shared/constants';
import { useContractRead } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';

const getIPFS = async (url) => {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (error) {
        console.log('error: ', error);
    }
};

export function SongCard({ song }) {
    const { tokenId, numberOfTokens } = song;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [hashMetadata, setHashMetadata] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [songUrl, setSongUrl] = useState('');

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
                <Text>
                    Song title: {title}
                </Text>
                <Text>
                    Song artist: {artist}
                </Text>
                <Text>
                    Song album: {album}
                </Text>
                <Text>
                    Tokens total supply: {numberOfTokens}
                </Text>
            </Container>

        </>
    );
};