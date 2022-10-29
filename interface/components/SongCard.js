import { Container, Grid, GridItem, Heading, Text } from '@chakra-ui/react';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';
import { SONG_CONTRACT_ADDRESS, IPFS_BASE_URL } from '../shared/constants';
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

export function SongCard({ tokenId }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [hashMetadata, setHashMetadata] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [songUrl, setSongUrl] = useState('');

    useContractRead({
        address: SONG_CONTRACT_ADDRESS,
        abi: SongABI.abi,
        functionName: 'tokenURI',
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
            <Container >
                <Text>
                    Song title: {title}
                </Text>
                <Text>
                    Song artist: {artist}
                </Text>
                <Text>
                    Song album: {album}
                </Text>
            </Container>

        </>
    );
};