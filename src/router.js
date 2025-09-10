import Login from '@/views/Login';
import Register from '@/views/Register'
import Dashboard from './views/Uers/Dashboard.vue';
import ContractList from '@/views/contractManagement/ContractList';
import CreateContract from '@/views/contractManagement/CreateContract';
import TemplateManagement from '@/views/contractManagement/ContractTemplate';
import AiConsulting from '@/views/legalAdvice/aiConsulting';
import BlockMessage from './views/Block/BlockMessage.vue';
import TransactionHash from './views/Block/TransactionHash.vue';
import Userll from './views/Uers/Userll.vue';
import Face from './views/Uers/Face.vue'



export default [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path:'/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/dashboard',
        component: Dashboard
    },
    {
        path: '/contractlist',
        component: ContractList
    },
    {
        path: '/createcontract',
        component: CreateContract
    },
    {
        path: '/templatemanagement',
        component: TemplateManagement
    },
    {
        path: '/aiconsultingt',
        component: AiConsulting
    },
    {
        path : '/blockmessage',
        component: BlockMessage
    },
    {
        path: '/transactionhash',
        component: TransactionHash
    },
    {
        path: '/userll',
        component: Userll
    },
    {
        path: '/face',
        component: Face
    }
]