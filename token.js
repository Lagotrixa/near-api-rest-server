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
            return await blockchain.View(
                mtContract,
                "mt_tokens",
                {token_id: tokenId}
            );
        } catch (e) {
            return api.reject(e);
        }
    },

    /**
     * @return {string}
     */
    MintMT: async function (tokenId, metadata, contractAccountId, account_id, private_key) {
        const mtContract = contractAccountId ? contractAccountId : settings.mt_contract;

        let account = !(account_id && private_key)
            ? await blockchain.GetMasterAccount()
            : await blockchain.GetAccountByKey(account_id, private_key);

        try {
            const tx = await account.functionCall(
                mtContract,
                "mt_mint",
                //TODO fix params
                {
                    "token_id": tokenId,
                    "metadata": metadata
                },
                '100000000000000',
                '10000000000000000000000');

            if (!tx.status.Failure)
                return tx.transaction.hash
        } catch (e) {
            return api.reject(e);
        }
    },

    TransferMT: async function (tokenId, receiverId, enforceOwnerId, memo, contractAccountId, owner_private_key) {
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
                //TODO fix params
                {
                    "token_id": tokenId,
                    "receiver_id": receiverId,
                    "enforce_owner_id": enforceOwnerId,
                    "memo": memo
                },
                '100000000000000',
                '1');
        } catch (e) {
            return api.reject(e);
        }
    }
};
