import createLogger from '@/shared/utils/logger';
const logger = createLogger('GetWallet');
import { UserRepository } from '@/repositories/user-repository';
import { assert } from 'console';
import { JsonRpcProvider, formatEther } from 'ethers';
import * as kmsClient from '@aws-sdk/client-kms';
import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import { getKeyId } from '@/shared/utils/crypto';
import { WalletInfo } from '@/models/interfaces';

export default async function getWallet(address: string, username: string): Promise<WalletInfo> {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');
    const keyDb = await userRepo.getKey(address, '', user);
    if (!keyDb?.keyArn) throw new Error('KeyArn not found');
    console.log('keyDb.keyArn: ', keyDb?.keyArn);
    const provider = new JsonRpcProvider(
      'https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6',
    ); //TODO get from an endpoint
    const balance = formatEther(await provider.getBalance(keyDb.address as string));
    return { address: address, balance, name: keyDb?.name ?? '', description: keyDb?.description };
  } catch (error) {
    logger.error(error, 'Error in get Wallet');
    throw new AggregateError([new Error('Error in get Wallet'), error]);
  }
}
