import { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { WorldIDWidget } from '@worldcoin/id';
import { Semaphore } from '@zk-kit/protocols';
import { defaultAbiCoder as abi } from '@ethersproject/abi';
import {
  connectSnap,
  getSnap,
  getMetaMaskAccount,
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
  max-width: 94.8rem;
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
  const [metaMaskId, setMetaMaskId] = useState(undefined);

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
        Welcome to <Span>Horsey</Span>
      </Heading>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}

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
            fullWidth
            disabled={!state.installedSnap}
          />
        )}
        {!state.installedSnap && (
          <Card
            fullWidth={true}
            content={{
              title: 'Connect',
              description:
                'Get started by connecting your Metamask Wallet to Horsey.',
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

        <h5>NFTs &nbsp; &nbsp; &nbsp; &nbsp;</h5>
        <Card
          content={{
            title: '🐴 horseyNFT',
            description: 'get exclusive access to the allowlist',
            button: (
              <WorldIDWidget
                actionId="wid_staging_f76caada4a091ea4b8423fa667be9f07" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={(verificationResponse) => {
                  console.log(verificationResponse);

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));

                  console.log(
                    abi.decode(['uint256[8]'], verificationResponse.proof)[0],
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
          disabled={!state.isFlask}
        />
        <Card
          content={{
            title: '🤓 testNFT_0',
            description: 'enter for a chance to win a testNFT',
            button: (
              <WorldIDWidget
                actionId="wid_staging_f76caada4a091ea4b8423fa667be9f07" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={(verificationResponse) => {
                  console.log(verificationResponse);

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));

                  console.log(
                    abi.decode(['uint256[8]'], verificationResponse.proof)[0],
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
          disabled={!state.isFlask}
        />
        <Card
          content={{
            title: '🦍 testNFT_1',
            description: 'access our invite-only discord',
            button: (
              <WorldIDWidget
                actionId="wid_staging_f76caada4a091ea4b8423fa667be9f07" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={(verificationResponse) => {
                  console.log(verificationResponse);

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));

                  console.log(
                    abi.decode(['uint256[8]'], verificationResponse.proof)[0],
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
          disabled={!state.isFlask}
        />
        <h5>DeFi &nbsp; &nbsp; &nbsp; &nbsp;</h5>
        <Card
          content={{
            title: '🏇 horseySwap',
            description: 'unlock gasless transactions',
            button: (
              <WorldIDWidget
                actionId="wid_staging_b2fccc6ca5fba5bdb479f8e5f1049e06" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={(verificationResponse) => {
                  console.log(verificationResponse);

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));

                  console.log(
                    abi.decode(['uint256[8]'], verificationResponse.proof)[0],
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
          disabled={!state.isFlask}
        />
        <Card
          content={{
            title: '🧲 testSwap_0',
            description: 'earn 10 testTokens with your first transaction',
            button: (
              <WorldIDWidget
                actionId="wid_staging_f76caada4a091ea4b8423fa667be9f07" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={(verificationResponse) => {
                  console.log(verificationResponse);

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));

                  console.log(
                    abi.decode(['uint256[8]'], verificationResponse.proof)[0],
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
          disabled={!state.isFlask}
        />
        <Card
          content={{
            title: '👨‍🌾 testSwap_1',
            description: 'unlock 10x boosted yields',
            button: (
              <WorldIDWidget
                actionId="wid_staging_f76caada4a091ea4b8423fa667be9f07" // obtain this from developer.worldcoin.org
                signal={metaMaskId}
                enableTelemetry
                onSuccess={(verificationResponse) => {
                  console.log(verificationResponse);

                  // console.log(Semaphore.packToSolidityProof(verificationResponse.proof));

                  console.log(
                    abi.decode(['uint256[8]'], verificationResponse.proof)[0],
                  );
                }} // pass the proof to the API or your smart contract
                onError={(error) => console.error(error)}
                debug={true} // to aid with debugging, remove in production
              />
            ),
          }}
          disabled={!state.isFlask}
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
