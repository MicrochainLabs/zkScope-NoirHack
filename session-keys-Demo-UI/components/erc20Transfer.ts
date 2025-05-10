import { AbiCoder, hexlify } from "ethers";
import { PROOF_SYSTEM_CONSTANTS } from "microch";
import { ENTRYPOINT_ADDRESS_V07,UserOperation,bundlerActions, getAccountNonce, getUserOperationHash, signUserOperationHashWithECDSA } from "permissionless";
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { Address, Hex, createClient, createPublicClient, encodeFunctionData, hexToBigInt, http, parseEther, parseUnits, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
import circuit from './session_keys_demo.json';
import { LeanIMT } from "@zk-kit/lean-imt";
import { hash } from "@/libs/utils";
import { LibZip } from 'solady'
import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js";



function uint8ArrayToHex(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

function padArray(arr: any[], length: number, fill: any = 0) {
    return arr.concat(Array(length - arr.length).fill(fill));
  }

export async function erc20TransferWithPaymaster(stablecoin: string, to: string, amount: string, accountIdentifier: string, sessionOwnerPrivateKey: string, sessionAllowedSmartContracts: string[], sessionAllowedToAddresses: string[]){
    
    /*********************************** User operation preparation ***************************************** */  
   
    const publicClient = createPublicClient({
        transport: http("https://endpoints.omniatech.io/v1/matic/mainnet/public"),
        chain: polygon,
    })
    
    const chain = "137";
    const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
    const endpointUrl = `https://api.pimlico.io/v2/${chain}/rpc?apikey=${apiKey}`
    
    const bundlerClient = createClient({
        transport: http(endpointUrl),
        chain: polygon,
    })
        .extend(bundlerActions(ENTRYPOINT_ADDRESS_V07))
        .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V07))
    
    const paymasterClient = createClient({
        transport: http(endpointUrl),
        chain: polygon,
    }).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07))
    
    const tokenAmount = parseUnits(amount, 18) // Adjust amount and decimals as needed    
    const erc20CallData = encodeFunctionData({
        abi: [
            {
                inputs: [
                    { name: "to", type: "address" },
                    { name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
            }
        ],
        args: [to as `0x${string}`, tokenAmount]
    })

    
    const callData = encodeFunctionData({
        abi: [
            {
                inputs: [
                    { name: "dest", type: "address" },
                    { name: "value", type: "uint256" },
                    { name: "func", type: "bytes" }
                ],
                name: "execute",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function"
            }
        ],
        args: [stablecoin as `0x${string}`, BigInt(0), erc20CallData]
      })

    const sessionOwner = privateKeyToAccount(sessionOwnerPrivateKey as Hex)
    const nonce = await getAccountNonce(publicClient, {
        sender: accountIdentifier as Address,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    })
      const gasPrice = await bundlerClient.getUserOperationGasPrice()

      const userOperation = {
        sender: accountIdentifier,
        nonce: nonce,
        callData: callData,
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
        //verificationGasLimit:BigInt(3100000),
        verificationGasLimit:BigInt(3000000),
        // dummy signature
        signature:
          "0x1f2782ac26be593e14125cdb1f3d406819ce9387ea09309a4d19fdb41ef43867740000e002001341c830a1c546b783959fb25d676f56a62f519bc7e0021ee00b000080e00b14e001000001e0010ae00d001f41d5f7f049948a986a3390ea1a55c21235868052e16762a40cd254114c6b359e1f017ffe5930ff7528fa81f3ed1bdc46ab596e8f46895a570734ced4aa58ddf5d801101ce00d57e01e000037e00727100111d2e0c13626750ed64c08662b007753e007200f00178e06268e8fbfc04d046131f9560b2011e0030010169f3be391339ab8af8a847eeac25992efe0031c60000e14d7187aaa5b6b56c4f1279782cd116013e001001015dab051aa3e65151d62bf4e7dae10e615e0011aa0000e01e90b50d59fd6703cc50528603bc1a015c00010a971a8bc343fdd0a332be950ab7e2dda4bc018e000000e2941174a995c60fadf952f1c364844e0001780001094d4da7441319e4a71b453fb87928fb1918016e002000e066c7b44f5a172fe88ba2a404d0a64e0021940001043ed1f65160ff375fcd439f35eef0a510e4014e004000e14acbfbe16aaa89d159510ba1e64aae0041b12000025775bd89b836b52b5b732bdf91fd533d62013e005000e0363b83e210f83f47af5ff42f5a767e0051c100008fab0b0c6dcf850971ef96e0ba1ff32e209800e2d18b2e0024477e8f322fbf1badb382033e00300e0777f109d3c7508977cfd5f7401fc746eca11b658e0039c60000e216040de86e03986f509b7fdfa45bf6013e001001041720f09878be3f320e4649fc2e6f9891ee0011aa0000d235f70dd79550631d903f9294d00e107ff109896d96274a1559ec4ebb6112c2ddf3386a035e001000e10dcad98789e9f66d5f26369fca59fe00118600010f9d9792202de7a348e5ae068e8fafcd9776015e003000e1a2bee953d583f4238fd81fbe1036ee0031a20001076a1a3d151f51214f0389ce8705a5aa87e2013e005000e2bad12ac4d5b138f70e202000e1802e0051c110037a5d3e12c105e73455100a0ac747436d32013e005001f1fa06d074d902c957d02ac4afcaf85121cf5af9a24b3c4a0dbd3763312bd70e61f2b1c765f0040c60ab85833397056c11e4758c3470cec65177472404e6e9aec421f08cbd21ab92fcb39299d60b68fa940009bca3fcd9f1e8b3d8c77b9ead2d848fc1f9c77e04f806c404d522eb46590ecbf045d874543b96b450df2901269d99e4fe61feed399167666857949bb25e491bd35009ee180e8c5d9c6126e341ad7e029cfca1f84b699a1abfbf7632e9d8c16c40786224fe4373436425eb0f7ea48408e505a131ff8c7d5d55ee33fddbe95afdf4c17f8045ed230a9f6b8895623daa3722356fc0c1f96f9ce9cc3dfae6b0138dd6bced89b0e24ebf5ede897799b546d9ecf245a98ef1f3be63ef694f7831a8d3f16beb03fb90255ee4a3fd13a8d8cf5f9dec6d004b6db1f1e856d7e07b70d329bfd9a40e7b72d2d704e52e2aa51a9511d175a78bab19dae1f2887cb97c30326c3aca8aa381cb4c827a4c80f95c9851e5e3827245d151f0aa41fe4d732af3bfd69f61284efb91960d916bf76f31840c5564ce0d6d87855eb3ae91fdf5744d4f7d2960254afc100f43d920da7abe6c62b44128405e5383f54f862951fa45d3f5f0e8e8f5b107ca3142f811c0fdf9bb802694429972929b2d283ca0bbe1f5acd30cafee9f991dd495933ba6e3d05c74a78641d3dd30f6c82244d807ec62d1f4425f6ec23d83e527849b0f545f4e9026b50b66a4d97d5100e32392e0616e20a1f8a4c965a3eb723fbfc3632deec9ac02a7bc9b6e688b0c6fe18f5706cafffc7db1f0a3c3ecf2a3e0120a236861b405f7914b052a562fea1e22ba291e9b912a84a8e1f3c033e66bfe5747cf8b96015a623d319a1bc9b2d16f5c43608f949f2a66eb3371fab5edbb1fc7202c4073eb628b136a6109e8416e4c4b88569653d8f5346351f5a1f6903b4092397cd828f47d528e060d611d13113ed9f1d1036dbb655c58f9160991f532b71d2655987ae80333cf44ca3d425f597dbe3707a54383c3f8323c6f03d1e1fdbb0c5f4f4eb0103ada7af95ad5cbb0cea7742c8dfbc5d8ea5f624b5b8ac18581f08109b710e240186d6752d007e8f7a0d14fc8c562c6a2135bfd00e751dd0d5cb1faed9ef7d88b64b8265b7bf16495a100364030105266829ef5602083384722ea21f89a7bf59720d8cfabff6f126ec6d19000a83a5bbf3b7b04d9dd944e3046522d91f178c5bba87a9b914aaf0a32050f20a05c11e62d7b5e24f9f7a6485cf688add2e1f86780c0bb159df38cf9b0df9e68a3b0ea32b01df43fe70827a444055796806041f005209c245b1f77ca7bc3142bfb45d25f3f09c9fe96ebca96c0166564b2f8a381ff72999566bfd8438ba6035e105d3a5170bcef16c251245bb5c4de40617a3e78f1f96b3be4d910bb78d0598b988376a68108b06f556ccbf2050030fe02c76a93bae1fad801674d88e587d47a6dc5fb0ac312782c3b4bd7325a81e2c38e74566bc15061fd2e9bf10933529ba7202b5897e6746027f7eeff16ed1191d2c2d13ccc0eb20e31f27751a8715734cdc2bb3efb738eb492acb0d7826a2df7e5f0858181d3c6aa8861fb27975df37e48e317eb387fae3d33e0c318c754a3163a47ffce47220defcddf81f602928118294532c25c9b023885f6410ae015da5efc442608f5e964167207cbd1f74321e11eb77bb6930938c70a0bfec2a78e07f986ed9e0e38a3131e86aa1bfd11f085660f4788206ccb8b4c65bb8c3231cce19672eb3d99160024539444f721b031f7df32e269a34ee8b360e90e6b805bf087c5d9c4b0889db9cc5a2dcd68b770d4d1fae4ad32ca3bc7c87b5ead503c1b38619e3cb0811b900e90351711fc2233ddd261fa21f9a0907f2f96fa95a0e76a9d8490d2c3c54694a5d105f98ba51a465c6e20d1f5a2a7de750943674f73cc4e2961f550ad9605abadeb1297ffb2b53dc54bda2171f5d24fda2094f0090168dbc4de8ebdd037f7d9feccd3740dd179008740cb45e971f7d30f4d1af4bd853cde0baad74018506a42d5bcfa31a9e3b7f8aa155d0b357e21f818fb14574adc2658481207e0e5fd01d06fcc9527a2859ffdf2d746f0df4c3f31f49f8693de0ba3b8d1d593cb855bc6e25315ea77adc46af58842d6ee9f426284d1fb557bfbd73820ceb782bd3e56ee99a082bfb6f99f51ee6234110d820096a3e3c1f9c4ddce5fa2f1a86d7b35a6676ef4c18bc112f0ec143ab3ea0054fdcecb7114f1f41490059123effb4ab5c84dae347aa2342cb22abe800174b5d710ccedc53fe611febee301492d61da52e1503d7fb9e90244262fb5ace0ee048389d4ad7623a32ed1ff9f4f024829f471683f0512a48a8131db259f9d5f3c1c21560fca9badf02d8761f28e19856d406158b15a5b912c16a272ce32d7b51b2c050f2e09a613c9f0145791fba8aec1872a675f2439e4c942fb5d32dcc341d5b08905d846c93e1ba93ae92ba1fce23ba39d657b72593751449679da00ce134a0aeb2662607f6eebac34b1a35921fdbf8871f64e0d3c469e294cd73f66f20b13c44d9c00a3e5da55026cd54b0417b1f02113600f8175ef26d898c9abafa390af4f536e160aeb85df3eceb9d9bcb6c7f1f09aaee22d30d0502ee003525380e702b7699aceb79d8d0489a05fa78e034f86b1f5d229c09ceddddf5a76ab1d7b5a95d0e3914981c8962dafaf65033b0b8baaf1d1f3d391be134b61f3afe7e9192c585aa292282f9799685717ef80b169d9120e1771f057554be395f2e4cf8f0de5578aa5d216b1c03e2a12a23a8339a1415d0207b421fa0850ff50158850b439ee4448b9af51efe620e5525308b3be119a7c3bc9a0a721f535177cf9892966729d07c1335dd392048145ad88b3f7004a53a0f48791ceb751fa4e5ba00122784f4f486a5d3376b3e2b436e570988289e1cfbea3368318b71421f55340a9a64586c56a0903b0c9fbd680e92dd53543e07e55d9c3ddb0725aad0921f87fca1afd52d1ce5c22f8da41ff6f809e4452bd4745fb0b0e3bef06f49b276011ff0ade33596de7cb3b2e010f5d144c023052a265c8246dbe518aaed140c4556ef1f77286a292b4421188953b054e51b0f1fd3f2dce62b70d7f704def2641ab2e1ce1fccc08f66de7ca3d33aee5f1f913cc4073174036deacdfbfcb73ad2ebb6c439401f2894b549339f5d39a750a99348ecee2d8acb99bab6222fc6271a6c13b7d6dbbc1f67cc73be90b9b3b3149dd37e1d77d1107af4fe9107ae2a146ddbcf479b0a46611f571fa74a280744367f03068a3a0a7728fa6402113419737187b402d0822a2b2b1f34bff5a5b3779dded6f30bad43e9ce1fa2bbb7b366fc27746b6c37f29d2ccf0d1f533d496b83e105ce15846c12fd27da17c4c5df1478c715ae63398aa80b14b06e1f73fb49fb6492268d75cbc00c65173b00f40f989931b5f47991997c1e782dc2281f20c8e96584dfc12b7247b08185e64210376e42971b74afce08fb18cdfc35cd281f705f9431f4dd706b2df93f40070f0022f6adf0d3fa983dabf68bf73af8497c5e1fc4d8d3513ad07906b24e34cd0ea17e2fe46c792d40269a2732bcaf93a8c34e601ffaeb7acb9d937c313ff690d9994b56209f3d02f8d36edec4d07591dc8d33335b1ffb73189781e9badfcb359de4cd249517798079b42f741a622b150d8f2c490c3b1f87f7405284550b99e34dde83875f47106abcd78ff900c1694a35570f3c29405b1fef38d4adbe10e4d7e2b6dc2ae456882af625c37b883e8ce3f0ab574b1dfa4da01fe8118b05abcf3371e28ed6e07f049616794cff0346a6e8030ccef8277295d21a1f15c63faf8db8173a9d4051bcf20a2c2f2853cc6bf50292459978a7743c9c407d1fbe2c9427071a269b119d43029de5fe22a5f38ef9e498944385e9eb89d5c6f1451f810995204eb9718936759fcdecf22613f5e38b6d9a647a1b152a30ae506564d51f838916fc4ffc424393471b970511a32e593dcd447d26f6f9c8d61cb7d770c2431f885f9f585aec1da88843bbc9d956b6031196a0efc734816c4ca9f7ffebb19c6c1fce61a6f8bd646bd197a8d6e3b12b6d132c78a6129a71309011957a3e49bc37c11f17b5df8d84a2e3c5c6cbf831b86b372e424a59551a43791d1906fec1467a209a1f9b51623a0bac1369b384653e344f4115552b26ec72e9968beaa655c3e58f2d041fc7159a83345da8648645ebe3519c1f1943a60e8e7a013081804f5de0bb35b6921ff345f9532b3f50cde8dc429ee7fc211b03bb7048dada4743b52d9e83e7ac9d411f7a5c2f2ea971739d09323e3b974bda10d336ff1a9c3f618ef50dfd5e1d6485bd1f512b03772ba3bacc9db2300da03788143b1679fa16af30bbd4035f656b329b011f64006da80b7f0ce422ef4f0567578124e248286d5b5e395338098f2b5309ffd51f0912bce40ce6f58775a4ddb8e9e83720f1affd626661e8eded898f284abd8e1f1f1b83cf2da98e11c5eb61fa4d66a26d0e02ec48290da3e7b4ac4e05e60108473b1f483dd6bb25adef6624fccb7fce9a02141143680163a1f4abac093cc48d9eacce1f070cc5c17adc14b2c179ba93a466c801434546fc0bd497ffdb67e72a0d6a22e71f56150226bd408df4d7623d8dcbe20813cdbe01c087676e263a15e5e4b00ee18c1f6628dbd7ff4e60996477c474d874f827e2f31f31c977483ebd09c89f3fe744a81f3ccd41465b719605a1a35165bdc7202aef60c74d10c2c6e383603609d2e11f821f9821fc9b447b5808c2abf9481e851e0385e1e6a7fe9dc963c36463af4d63d7a21f2f43361a099ac629e5ac1d0ad567972f85e35bd126639376547ecf791603b19b1f9f16abb02add119d60409d09aa008b1fc3bd099e2969864c701d1a4845b1ca121f58df88e2caeee7f15fb4fee9c3c3ad05093da67aa0310bc1d96a702a0c4b66f11f2817addbb0931a6639aed90cf88bbc141d5deb92df35f274b4775703805b5d3c1f0e1d7fd5c27bf489d85ed9188321d8198629823a54821f521fb8a3d9e004c0001fb41da58e9697b3acf268c835a9184017419a97c4a756b14b87556e42a10c1a051fe259633d5e969df27eca129504cf711f5f3e684afc139008440661a85c71a5bc1ffb0caca319f55e901f76bbd4592e6f1e6ae03b1b49eeece81f505f6a49b2367e1fd4964824b2aaa277c7d0151393838106a3c4ab3282b574658280d34bbb8342cc1fbdd7999f635a65dba95f978ad98ae619aa202ee12724a2ceef653d801ac8d19f1f39fb4ef4e31608bdbe14ce5425a9f0299308c0c09b7cec7beeefde55038b7ce11f9304a27206fefb6e1bb88cd61336bd20dced7da2339164ace870d604e92bcc021ff13d6a4c31ea44f70d69d9eec80d7e2f1662df3c0e287fa37a31c642a6bf11341f3cd841d9b63d925fcce56e618cb6d5058a6a9127685d8aecc55d802dbda1f0a61fb7b52e9727ccb03892b546f71dcdd32d4350bf327b7c9a43f9cb273ebfedb3721f9550afbfe308af8ecf1a9afcad09911ddba1bc0b64b1829d3a8dcc029154eb221f255addebb2c6982c6215fbf358f5251906ad0c66374d336838ad7084e0d38a7d1f9a0e5ecaf24de2427d088a640340a0013cee0a5d399e5999a13afe76b8a1fe9c1fc6c8c29ca0d9f6740d9e3c23fc28b61ce6a6431660393dcdbca82d8d40c26d711fdecf282e00a9f683173237a605b45e0e41dab220d9cd835fbe66e80df719a0d91f56749c4b466112d24d04ce1edc25c004537eb0162ffe7d0d8e8e47d5db7fb31a1f8c2f570bfa07f366ac916076c42fa00bc8ad0c10e42b63fbc5b1969eef1c024b1fad0adf04dfd6353c43f952136c263c25d4c47606b06c2f21ec5ea1c526348f961fbf9b392c22c2116a1c2127c64e0cac2753d3ffe457982a39c9b8922a3bfcfdb41f07a855246c0cdb64b8e02f389ef35d02128d6ee306edc2167cfac01c1b482d4b0f9ad3031720f06912602641e0d0e51d00e0fd00e0fd00e0fd00e0fd00e0fd00e0fd00e0fd00e0fd00e0fd00e0fd00e0fd00e0b4001f1db6de04052237bd49485419a1a82661c07c0c8c8bdac057174d78106ebd72f61f15a54d6887406d3bda6c54992ba105aee2ba43eea33e4109f6bfc4e6f89d95f71f0749e700898e3f5366361200b795271e642e7675177c33e7022eef84b396657a1f1f5a5b771d70c60c8b2fd08f3746f2c33390e917c0342fae2af4362f7493441c1f288383eac1d717fc5c6c5c818a68492ca70effae328e1b445874fc605fe32fa81f13bb15d02f67ccebefb14652bee51bd771bd197fb9f92726a57278953f02268f1f0c5b76c1bf9137e693ae0a19e001c97450f4d2e80ab9fa472d2d63250fc2c0f91f0acb65b7c18f30f6ef2b883356f7effabf720053d6f149aa9bb7758a044261ff1f12db48f92db1fa95ce3e9357692c41891244fbe5d52df6b9909ec9da0b36e6f61f0dd41f5a0a0105b06296a7ae41a2533ed4297c96588a4794c2e91bd2fa988f3f1f193f8c71fd67a4221a7f8a3b543da50b08811cf15e94e9951d4da86690a341711f1e1a21eab6cbdbc9246aefc7fa279ca43009ceabb3ddd3b3f71c8cda0f44e98e1f193c9299c8d4467bddb96e7a92ec8d364e837e486fbefae481675927f6088a531f1562576fe47974fca4edf59aabafa7dd089a0ea9cf4bec617670418b7088711c1f1a631f10b7be5c5ef27045c292ec9365b676cff8b3b2a03efc7b6c0b1eb1c6371f0c1487f5d8bad084fd8bedd4b890536c0ae08c0fc66c6df757c6359b2e1b2b531f1da73393e75df9113ab3984d66e3b91fe4644d2411803655658183ba7312c0001f102f665727f43530ca26376b4acd7abc9dce598721950a38f3a3dbbb9b2debe71f303117cde914ea6cd6eb7f8a4257dc1e5fdc5b5cc83057ddb9c06859d30485771f15cd0f5ceacd2c6fdc330424cc560f6eb20c92e3aae4fd09bf6a117c4adf9c231f0d0109999c8a511d348f46e7220e79adf25068140fd16a6913828ee84336e3961f134abaef980fc41d04b02a55011ce6d437271940aa046f3509009abf42b046d11f1e9523f65052e57bbea0560ef028fb4a9aa1d0d968336a5c70564ae81edcf1c11f2b4c6f09b1f7f39306ee33af3126f729394bbf359edb57f8ae6bf6b7a4bd14721f0eefafda599b6dfc3f682a449ccbea1a30ba0932d0bf4f0161f8f2972faf92821f296003ff63b81c296ebd533c53127b34703479f66c94d931b467e3d4915ce3aa1f0d1a8a410542334948965300e3f43b8c6f9c7b546cff08d0daae53323391bac01f28ea4edc7c4dcae9447884f71ff4f8163dd325594b325a5fe2699c461cb0bcbb1f08c7a5a70bb9d292b534ca523a4cd9f2bbdc85c8e55916dff8114c58a9cb2ed31f10f161dbfb4fb4db77ca6bc49fbbd71d30fd911acd497f87419613ab2d87754f1f2470d0daa43855a2dd72b62a3e6632abb9e222c0e515ebcef1d9ac772938d4ee1f1e01e3280c10b489202d7c672b89df819d7761af616d3c1f6167e00a59f7c9e91f2aebed97cc66cb7d7dcc57905233d984cf5bea4ec3491d4cfddf53c5ba9bcffd1f1d08bbd47d989c1bcb5b6f13561cc1e513f7d9fde677a2df9b708deb6d4c2dd7e0171f1f243967fb17afc5ec53a6a1eead090f7818c069e21d74950a6f03425c58b3cec91f0d8d46bfda10fabe863b29d7c8b991fc831941a7680019dc5f299d2374ade7cf1f1e1c6c18303ace2d444618e114414b3920ff266ecb5f268e297079c368bc2a621f13dbda00664c2d297846cd20c85d2c01fcd95c07e9490945cede2885c78521171f0237c664ae0ca17a74f3f63a7a3667370b1b23bccf328352c4d293a8ae1e4c0ff006fe10257f46e075368ce35f6f1ef15919c19148e0061f10000008033b8e1d4015ac9a33d77b16c2a02011e00300103d53a061c21a28605eed2cfcb0702de35de0031c60000e03059cd6f1881fefa05dbd8b083b6c6013e0010010daf4bb87a0b2e0fc830507afdc1e12982ce0011aa0000e06ce399295871f8e1a8098036aec66a015c00010d93acafafde398ddc27f87d18145b2d050c018e000000e22923ecb18accefeb83f977fdb8fbde0001780001081f5491897af64097252de1a00737f74c28016e002000e284533166179d9e672353dfe843fe2e00219400010b041fd05445dcd8bf8e9f01599d021f7194014e004000e224bd88a8e9ac0ef4451308fc0a70ce0041b1200004e5bba365b73fa9f11fab1a67f556ad0c92013e005000e0d3da138fbe29c06c513dd74d4a11fe0051c1100ce961ed3528df0ffad635d7ac37feed5162013e005000e195ee39e3a6e6e604d206c27359377e0051c1100bf4464645b61f3428420ae7d791fa816882013e005000e026ddb777b039d2b47d0e5f348c31ce0051c1100350e5bc584fa15d920303b2cc23d2f6b8b2013e005000e1769188178974524b4428742f8afd7e0051c11001624cf1f46389e1775deeae2361236121a2013e005000e09500a15fdaaee7a56fa7e5f6d4297e0051c1100154699de9f28be8afeaf9a2bb199f000252013e005000e2b20a5c020375f4e86bc65d026e75ee0051c1100276f369b31620509b0f4ea2993d58b89292013e005000e095cc0b04d5fbedf596a62dcfb6318e0051c1100d82302ba4c32639be37d296e90d80032272013e005000e233e53ff398cff7b6c1ba20a4c3504e0051c1100edd272b1212bf5e8df6479600b71f7a2582013e005000e1b0908b7ff98b3834eee2ae791a8a7e0051c11003e4cf41023cc1c70fcfec29d74b5f1b3e02013e005000e27e7003ac09e3cd96d67ec82ae31a8e0051c1100d523a8449fb6ff5181d6020f491fe744bb2013e005000e17c9f0de01cc27587429e583d12284e0051c11002fc62fd34436a236392b49657f0189e7df2013e005000e238b3796507cb031a75bd78bb0cd6ee0051c100043ff92e409a9615a4d2db7c9ee358e39e30a3f0cb6002acd4477ac458e8a52b3f5e2073f11d59c63395de013cca349020aeea0e6b32b00e007000e1ffc45d8412797971612b5cb06b4aee0061e10c409afd9f50140a4bb4c0eb56f13d6d4f4e0061f237f0df05762b2a7e9dea6c4e2968d727e2011e003001053c97999c24172ab08d60b43db40ac769ce0031c60000e2a9308d359debeed89287c101d68396013e001001082fd9989cf9912076e1b0e50b7b84fdbf0e0011aa0000e259629df2cc9552f753d8324162a22a015c00010937e3fce6f6ca65c9645700b6a856af7dec018e000000d12fd900240dad5e6d4f02b9a1828e0077f1060ebfb03066464804e80cb1e38ba206c7fe00037c0000e0bced8b3a2366130ff7e23d92c7a45c016a0000f3d29e53e64f2b33dfea84aaa1bd94596e407df100000017c662984c4c937ba37740dd5fe3b2011e003001032806e6ab28a0fe47f01850888290899f6e0031c80000cfa64b070c8bec4d49e89e3ee3ee3073f10bd88c846ee6dbf81521416e6d33b933cec8033e002000e1bee4abb1c096b50d705df86bbd5b0e00219400010c25aa8f698b489c9a712b46ce46d277bea4014e004000e06241aff2e0ff6920d5c1a1678fe79e0041b12000026711e4e6b876dc8472d3934db83ddd0702013e005000e1d189e7f40642ae1e65f0ba602a838e0051ce008000001e00811e025000002e0252ee00800e0fd7fe0fd7fe0fd7fe0fd7fe0fd7fe03a7f1f2d777dbc262261c45553087ab41f3040b24b3e53cee6e335a3eabad881ecbddf1f1f8d626f05aa0c0504ba412f8a1fc8db9c3d9d2112cf3b357295b32a1758f8891f1a5fe56579dc68f14207dfaa5edfdd60e09b39dadf3a054d7d7753efe254cd551f2df991c6e08072e953418f6af8ac26b483c09e52feaa1049cb82c7807d038ed11f2fe668c4c8a98363a5a5d326a5cc58580e88b724a44537c8023c01d0b76598471f1122fe2a5c2ecd49ec59cc4d4bf32c536be193e232f290d1334b894d661836991f1dd089050694df8568a95bdbef96097fa4deabcb229feaff7ea2b4ef1dbd511c1f1e417789d7db071f7f5e5b3540c305667a5c9e96ac72393e37f259c9b4439be61f15ef5b2d959d6d617e8b828691607fac8aee9461756facd3975e2bec4f6ce1cd1f186e3796705e775585ec557daaf6b613a70bffdf0bcb2ed9d5e6c06e53122ae71f22087c1570ec73b10b05fb411b681a65f5d7181784e5bc7a5e3d6d83f25329a31f000b274f0d50062cae8f2d5cf8d829890e6d4bd13c1ea9caa30008613cccbfc01f165829861944634ca47c6a37825578cd5264a9470589e93c8e8fd4a46296dc9e1f0dc528c40b1acddb45924a5a456ee965f39cecb679eee96060e1351a03df18d41f1e70b15eae7d41b0f4a5463f6b8afcd69ce88b6c2f557032239a7ff942cb5a3e1f14c7a26f3dc171c85ebb9c6be91de986b212477e3fa8aebde6e43c77904b813ce70871e0fd00e06f0010893b185b0d271f12a89a5eee66ba1f2305e1088e0e24f2abb12c7a41f910078914c1ad52e0061f10e7bf26b433a27acdef8191ee1304c4aacbe0061f2ea10c27af4f618054519e27d706dacceb075f1061b9f9de23833fcff0d40900a5b771fee52031e005000e23fdba9a90ee7479bfc7925d3da23ae0051c1100f61b516bc4812dcd28d95a800eb66d0bfb2013e005000e0d2b3fd2a61abbdec97fcf769e85fb" as Hex
    }
    const sponsorUserOperationResult = await paymasterClient.sponsorUserOperation({
        userOperation,
    })
    
    const sponsoredUserOperation: UserOperation<"v0.7"> = {
        ...userOperation,
        ...sponsorUserOperationResult,
    }

    console.log("Received paymaster sponsor result:", sponsorUserOperationResult)


    let userOpHash = getUserOperationHash({
        userOperation: sponsoredUserOperation,
        chainId: polygon.id,
        entryPoint: ENTRYPOINT_ADDRESS_V07
    })
    let op = BigInt(hexlify(userOpHash))
    op %= PROOF_SYSTEM_CONSTANTS.SNARK_SCALAR_FIELD


    /*********************************** User operation signature and proof generation ****************************** */ 
    
 
    const transaction= {
        dest: BigInt(stablecoin),
        value: BigInt("0x0"),
        functionSelector: BigInt("0xa9059cbb"),
        Erc20TransferTo: BigInt(to)
    }

    const transactions = [
        transaction
    ]
   
    const smartContractCallsWhitelistTree = new LeanIMT(hash)
    const valueTransferWhitelistTree = new LeanIMT(hash)


    
    for (let address of sessionAllowedSmartContracts) {
        await smartContractCallsWhitelistTree.insert(BigInt(address));
    }

    for (let address of sessionAllowedToAddresses) {
        await valueTransferWhitelistTree.insert(BigInt(address));
    }

      const circuitInputs = {
        smart_account: accountIdentifier,
        session_id: sessionOwner.address,
        user_op_hash: toHex(op),
        contract_whitelist_root: toHex(smartContractCallsWhitelistTree.root),
        value_whitelist_root: toHex(valueTransferWhitelistTree.root),
        dest:[] as string[],
        value: [] as string[],
        function_selector: [] as string[], 
        erc20_transfer_to:[] as string[], 
        native_coin_transfer_siblings: [] as string[][], 
        native_coin_transfer_path_indices: [] as string[][],  
        native_coin_transfer_merkle_proof_length: 0,   
        smart_contract_call_siblings: [] as string[][],
        smart_contract_call_path_indices: [] as string[][],
        smart_contract_call_merkle_proof_length: 0,
        erc20_transfer_siblings: [] as string[][],
        erc20_transfer_path_indices: [] as string[][],
        erc20_transfer_merkle_proof_length: 0 
    }
    
    const depth = 10


    for(let tx of transactions){
    
        circuitInputs.dest.push(toHex(tx.dest))
        circuitInputs.value.push(toHex(tx.value))
        circuitInputs.function_selector.push(toHex(tx.functionSelector))
        circuitInputs.erc20_transfer_to.push(toHex(tx.Erc20TransferTo))
        if(tx.value != BigInt(0)){
          const index= await valueTransferWhitelistTree.indexOf(BigInt(tx.dest));
          const allowedToProof= await valueTransferWhitelistTree.generateProof(index);
          circuitInputs.native_coin_transfer_siblings.push(padArray(allowedToProof.siblings.map(v => toHex(v)), depth, "0x0"))
          circuitInputs.native_coin_transfer_merkle_proof_length = allowedToProof.siblings.length;
          const merkleProofIndices = []
          for (let i = 0; i < depth; i += 1) {
            merkleProofIndices.push((allowedToProof.index >> i) & 1)
          }
          circuitInputs.native_coin_transfer_path_indices.push(merkleProofIndices.map(v => toHex(v)))
        }else{
          //static value
          circuitInputs.native_coin_transfer_siblings.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
          circuitInputs.native_coin_transfer_path_indices.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
        }
    
        if(tx.functionSelector != BigInt("0x0")){
          const index= await smartContractCallsWhitelistTree.indexOf(BigInt(tx.dest));
          const allowedSmartContractProof= await smartContractCallsWhitelistTree.generateProof(index);
          circuitInputs.smart_contract_call_siblings.push(padArray(allowedSmartContractProof.siblings.map(v => toHex(v)), depth, "0x0"))
          circuitInputs.smart_contract_call_merkle_proof_length = allowedSmartContractProof.siblings.length;
          const merkleProofIndices = []
          for (let i = 0; i < depth; i += 1) {
            merkleProofIndices.push((allowedSmartContractProof.index >> i) & 1)
          }
          circuitInputs.smart_contract_call_path_indices.push(merkleProofIndices.map(v => toHex(v)))
        }else{
          //static value
          circuitInputs.smart_contract_call_siblings.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
          circuitInputs.smart_contract_call_path_indices.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
        }
        if(tx.Erc20TransferTo != BigInt("0x0")){
          const index= await valueTransferWhitelistTree.indexOf(BigInt(tx.Erc20TransferTo));
          const allowedSmartContractProof= await valueTransferWhitelistTree.generateProof(index);
          circuitInputs.erc20_transfer_siblings.push(padArray(allowedSmartContractProof.siblings.map(v => toHex(v)), depth, "0x0"))
          circuitInputs.erc20_transfer_merkle_proof_length = allowedSmartContractProof.siblings.length;
          const merkleProofIndices = []
          for (let i = 0; i < depth; i += 1) {
            merkleProofIndices.push((allowedSmartContractProof.index >> i) & 1)
          }
          circuitInputs.erc20_transfer_path_indices.push(merkleProofIndices.map(v => toHex(v)))
        }else{
          //static value
          circuitInputs.erc20_transfer_siblings.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
          circuitInputs.erc20_transfer_path_indices.push(["0x0", "0x0", "0x0", "0x0", "0x0", "0x0", "0x0","0x0", "0x0", "0x0"])
        }
    }

  //@ts-ignore
  const noir = new Noir(circuit);

  //@ts-ignore
  const { witness } = await noir.execute(circuitInputs);

  //@ts-ignore
  const backend = new UltraHonkBackend(circuit.bytecode);

  console.log("Proof Generation ...");
  const proof = await backend.generateProof(witness, { keccak: true });


  const signature = await signUserOperationHashWithECDSA({
    account: sessionOwner,
    userOperation: sponsoredUserOperation,
    chainId: polygon.id,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  })

  const defaultEncode= AbiCoder.defaultAbiCoder();
  const finalSignature = defaultEncode.encode(
    ["uint256","address","bytes","bytes"],
    [ hexToBigInt(proof.publicInputs[8] as `0x${string}`), sessionOwner.address, signature, proof.proof]);
  sponsoredUserOperation.signature= LibZip.flzCompress(finalSignature) as `0x${string}`;

  const userOperationHash = await bundlerClient.sendUserOperation({
    userOperation: sponsoredUserOperation,
  })

  console.log("Received User Operation hash:", userOperationHash)

  console.log("Querying for receipts...")
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOperationHash,
  })
  const txHash = receipt.receipt.transactionHash

  console.log(`UserOperation included: https://polygonscan.com/tx/${txHash}`)

  return {
    txHash: txHash,
    txScan: `https://polygonscan.com/tx/${txHash}`,
    success: true
  }


}