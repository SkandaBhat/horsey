import contract from '../../../../contract.json';
import { useContext, useState } from 'react';
import { Biconomy } from '@biconomy/mexa';
import { Contract } from 'ethers';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { WorldIDWidget } from '@worldcoin/id';
import { Semaphore } from '@zk-kit/protocols';
import { defaultAbiCoder as abi } from '@ethersproject/abi';
import {
  connectSnap,
  getSnap,
  getMetaMaskAccount,
  getMetaMaskSigner,
  sendHello,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';

// type ExternalProvider = {
//   isMetaMask?: boolean;
//   isStatus?: boolean;
//   host?: string;
//   path?: string;
//   sendAsync?: (
//     request: { method: string; params?: any[] },
//     callback: (error: any, response: any) => void,
//   ) => void;
//   send?: (
//     request: { method: string; params?: any[] },
//     callback: (error: any, response: any) => void,
//   ) => void;
//   request?: (request: { method: string; params?: any[] }) => Promise<any>;
// };

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [metaMaskId, setMetaMaskId] = useState('');

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();
      const metaMaskAccounts = await getMetaMaskAccount();
      let metaMaskAccountId;
      if (metaMaskAccounts.length === 0) {
        // MetaMask is locked or the user has not connected any metaMaskAccounts
        console.log('No MetaMask Account ID Found.Please connect to MetaMask.');
      } else if (metaMaskAccounts[0] !== metaMaskAccountId) {
        metaMaskAccountId = metaMaskAccounts[0];
      }
      console.log('Metamask Account:', metaMaskAccountId);
      setMetaMaskId(metaMaskAccountId);

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        <Card
          content={{
            title: 'Connect with worldcoin',
            description: 'Connect with worldcoin',
            button: (
              <WorldIDWidget
                actionId="wid_staging_f76caada4a091ea4b8423fa667be9f07" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={async (verificationResponse) => {
                  const biconomyAPIKey =
                    'XZtM2OhNT.1beb4f6e-b528-4ffe-81b9-e92e4f05817f';
                  const contractAddress =
                    '0xd5B32069b749DFCE007B04451BaDEf0D8faeDF73';

                  console.log('verificationResponse', verificationResponse);

                  const { nullifier_hash, merkle_root } = verificationResponse;
                  const proof = abi.decode(
                    ['uint256[8]'],
                    verificationResponse.proof,
                  )[0];

                  // TODO: Implement biconomy here
                  const biconomy = new Biconomy(window.ethereum, {
                    apiKey: biconomyAPIKey,
                    debug: true,
                    contractAddresses: [contractAddress], // list of contract address you want to enable gasless on
                  });

                  await biconomy.init();

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));
                  // console.log('decoded value',['uint256[8]'], verificationResponse.proof)[0]);
                  const signer = await getMetaMaskSigner();
                  console.log('signer:', signer);
                  const newContract = new Contract(
                    contractAddress,
                    contract.abi,
                    signer,
                  );

                  const gasEstimated =
                    await newContract.estimateGas.verifyAndMintNFT(
                      metaMaskId,
                      merkle_root,
                      nullifier_hash,
                      proof,
                    );

                  await newContract.verifyAndMintNFT(
                    metaMaskId,
                    merkle_root,
                    nullifier_hash,
                    proof,
                    {
                      gasLimit: Math.ceil(gasEstimated.toNumber() * 1.1),
                    },
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
        />
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
