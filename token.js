const blockchain = require('./blockchain.js');
const api = require('./api.js');

const fs = require('fs');
const settings = JSON.parse(fs.readFileSync(api.CONFIG_PATH, 'utf8'));

module.exports = {

    /**
     * @return {string}
     */
    ViewMT: async function (tokenId, contract) {
        try {
            const mtContract = contract ? contract : settings.mt_contract;
            if (tokenId){      //Show all tokens
                return await blockchain.View(
                    mtContract,
                    "mt_token",
                    {"token_ids": [`${tokenId}`]}
                );
            }
            else{                   //Show token by id
                return await blockchain.View(
                    mtContract,
                    "mt_tokens",
                    {"token_ids": ""}
                );
            }
        } catch (e) {
            return api.reject(e);
        }
    },

    /**
     * @return {string}
     */
    MintMT: async function (tokenId, supply, metadata, contractAccountId, account_id, private_key) {
        const mtContract = contractAccountId ? contractAccountId : settings.mt_contract;

        let account = !(account_id && private_key)
            ? await blockchain.GetMasterAccount()
            : await blockchain.GetAccountByKey(account_id, private_key);

        try {
            const tx = await account.functionCall(
                mtContract,
                "mt_mint",
                {
                    "token_id": tokenId,
                    "supply": supply,
                    "token_owner_id": account_id,
                    "token_metadata": metadata
                },
                '100000000000000',
                '0');

            if (!tx.status.Failure)
                return tx.transaction.hash
        } catch (e) {
            return api.reject(e);
        }
    },

    TransferMT: async function (tokenId, receiverId, amount, enforceOwnerId, memo, contractAccountId, owner_private_key) {
        try {
            const mtContract = contractAccountId ? contractAccountId : settings.mt_contract;
            let account;

            account = !(enforceOwnerId && owner_private_key)
                ? ((enforceOwnerId === settings.master_account_id)
                    ? await blockchain.GetMasterAccount()
                    : await blockchain.GetUserAccount(enforceOwnerId))
                : await blockchain.GetAccountByKey(enforceOwnerId, owner_private_key);

            return await account.functionCall(
                mtContract,
                "mt_transfer",
                {
                    "token_id": tokenId,
                    "receiver_id": receiverId,
                    "amount": amount,
                    "owner_id": enforceOwnerId,
                    "memo": memo
                },
                '100000000000000',
                '1');
        } catch (e) {
            return api.reject(e);
        }
    },

    /**
     * @return {string}
     */
         RegisterMT: async function (tokenId, contractAccountId, account_id, private_key) {
            const mtContract = contractAccountId ? contractAccountId : settings.mt_contract;
    
            let account = !(account_id && private_key)
                ? await blockchain.GetMasterAccount()
                : await blockchain.GetAccountByKey(account_id, private_key);
    
            try {
                const tx = await account.functionCall(
                    mtContract,
                    "register",
                    {
                        "token_id": tokenId,
                        "account_id": account_id,
                    },
                    '100000000000000',
                    '0');
    
                if (!tx.status.Failure)
                    return tx.transaction.hash
            } catch (e) {
                return api.reject(e);
            }
        }
};
