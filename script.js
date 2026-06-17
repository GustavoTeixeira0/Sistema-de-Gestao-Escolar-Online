document.querySelectorAll('.cpf-mask').forEach(input => {
    input.addEventListener('input', function () {
        let cpf = this.value.replace(/\D/g, '');

        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        this.value = cpf;
    });
});

const STORAGE_KEY = 'sge-usuarios';
const SESSION_KEY = 'sge-usuario-logado';
const ESCOLAS_KEY = 'sge-escolas';

function carregarUsuarios() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

function carregarEscolas() {
    const raw = localStorage.getItem(ESCOLAS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function salvarEscolas(escolas) {
    localStorage.setItem(ESCOLAS_KEY, JSON.stringify(escolas));
}

function escolaExiste(nomeDaEscola) {
    const escolas = carregarEscolas();
    return escolas.some(e => e.nome.toLowerCase() === nomeDaEscola.toLowerCase());
}

function carregarEscola(nomeDaEscola) {
    const escolas = carregarEscolas();
    return escolas.find(e => e.nome.toLowerCase() === nomeDaEscola.toLowerCase());
}

function carregarSessao() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

function salvarSessao(usuario) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

function limparSessao() {
    localStorage.removeItem(SESSION_KEY);
}

function mostrarMensagem(id, mensagem, tipo = 'danger') {
    const elemento = document.getElementById(id);
    if (!elemento) {
        console.warn(`Elemento de mensagem não encontrado: ${id}`);
        return;
    }
    elemento.textContent = mensagem;
    elemento.className = `msg text-${tipo}`;
}

function validarCPF(cpf) {
    const apenasDigitos = cpf.replace(/\D/g, '');
    return apenasDigitos.length === 11;
}

function limparCpf(cpf) {
    return cpf.replace(/\D/g, '');
}

function resolverCpfPorNomeOuCpf(raw) {
    const usuarios = carregarUsuarios();
    if (!raw) return null;
    const apenas = limparCpf(raw);
    if (apenas.length === 11) return apenas;

    const nome = raw.trim().toLowerCase();
    if (!nome) return null;

    // busca exata
    const encontrados = usuarios.filter(u => u.nome && u.nome.toLowerCase() === nome);
    if (encontrados.length === 1) return limparCpf(encontrados[0].cpf);

    // busca por inclusão
    const parciais = usuarios.filter(u => u.nome && u.nome.toLowerCase().includes(nome));
    if (parciais.length === 1) return limparCpf(parciais[0].cpf);

    return null;
}

function fazerLogin() {
    const rawCpf = document.getElementById('loginCpf').value;
    const cpf = limparCpf(rawCpf);
    const loginNomeInput = document.getElementById('loginNome')?.value.trim() || '';
    const senha = document.getElementById('loginSenha').value;
    const escola = document.getElementById('loginEscola').value.trim();

    if (!validarCPF(rawCpf)) {
        mostrarMensagem('msgLogin', 'CPF inválido. Use 11 dígitos.', 'danger');
        return;
    }

    if (!senha) {
        mostrarMensagem('msgLogin', 'Informe sua senha.', 'danger');
        return;
    }

    if (!escola) {
        mostrarMensagem('msgLogin', 'Informe a escola.', 'danger');
        return;
    }

    const usuarios = carregarUsuarios();
    const usuario = usuarios.find(u => limparCpf(u.cpf) === cpf && u.escola.toLowerCase() === escola.toLowerCase());

    if (!usuario) {
        mostrarMensagem('msgLogin', 'Usuário não encontrado. Verifique CPF e escola.', 'danger');
        return;
    }

    if (usuario.senha !== senha) {
        mostrarMensagem('msgLogin', 'Senha incorreta.', 'danger');
        return;
    }

    salvarSessao({ cpf: usuario.cpf, escola: usuario.escola, tipo: usuario.tipo, nome: usuario.nome || loginNomeInput || '' });
    mostrarMensagem('msgLogin', `Bem-vindo(a), ${usuario.tipo}! Sessão iniciada.`, 'success');
    renderSessao();
}

function cadastrar() {
    const nome = document.getElementById('cadNome')?.value.trim() || '';
    const rawCpf = document.getElementById('cadCpf').value;
    const cpf = limparCpf(rawCpf);
    const senha = document.getElementById('cadSenha').value;
    const escola = document.getElementById('cadEscola').value.trim();
    const tipo = document.getElementById('cadTipo').value;

    if (!validarCPF(rawCpf)) {
        mostrarMensagem('msgCadastro', 'CPF inválido. Use 11 dígitos.', 'danger');
        return;
    }

    if (!senha || !escola || !tipo) {
        mostrarMensagem('msgCadastro', 'Preencha todos os campos corretamente.', 'danger');
        return;
    }

    if (!escolaExiste(escola)) {
        mostrarMensagem('msgCadastro', 'Escola não cadastrada no sistema. Verifique o nome ou faça o cadastro da escola primeiro.', 'danger');
        return;
    }

    const usuarios = carregarUsuarios();
    const jaExiste = usuarios.some(u => limparCpf(u.cpf) === cpf && u.escola.toLowerCase() === escola.toLowerCase());

    if (jaExiste) {
        mostrarMensagem('msgCadastro', 'Já existe uma conta registrada com este CPF e escola.', 'danger');
        return;
    }

    usuarios.push({ cpf, senha, escola, tipo, nome });
    salvarUsuarios(usuarios);
    mostrarMensagem('msgCadastro', 'Cadastro concluído com sucesso! Agora faça o login.', 'success');
    document.getElementById('cadSenha').value = '';
    document.getElementById('cadTipo').value = '';
    document.getElementById('cadNome').value = '';
}

function cadastrarEscolaEAdmin() {
    const escolaNome = document.getElementById('escolaNome')?.value.trim() || '';
    const escolaCnpj = document.getElementById('escolaCnpj')?.value.trim() || '';
    const escolaEmail = document.getElementById('escolaEmail')?.value.trim() || '';
    const escolaTelefone = document.getElementById('escolaTelefone')?.value.trim() || '';
    const escolaWhatsapp = document.getElementById('escolaWhatsapp')?.value.trim() || '';
    const escolaTipo = document.getElementById('escolaTipo')?.value.trim() || '';
    const escolaCep = document.getElementById('escolaCep')?.value.trim() || '';
    const escolaRua = document.getElementById('escolaRua')?.value.trim() || '';
    const escolaNumero = document.getElementById('escolaNumero')?.value.trim() || '';
    const escolaBairro = document.getElementById('escolaBairro')?.value.trim() || '';
    const escolaCidade = document.getElementById('escolaCidade')?.value.trim() || '';
    const escolaEstado = document.getElementById('escolaEstado')?.value.trim() || '';
    const admNome = document.getElementById('admNome')?.value.trim() || '';
    const admRawCpf = document.getElementById('admCpf')?.value.trim() || '';
    const admCpf = limparCpf(admRawCpf);
    const admSenha = document.getElementById('admSenha')?.value.trim() || '';

    if (!escolaNome || !escolaCnpj || !escolaEmail || !admNome) {
        mostrarMensagem('msgCadastroEscola', 'Preencha pelo menos: Nome do administrador, Nome da escola, CNPJ e E-mail da escola.', 'danger');
        return;
    }

    if (!validarCPF(admRawCpf)) {
        mostrarMensagem('msgCadastroEscola', 'CPF do administrador inválido.', 'danger');
        return;
    }

    if (!admSenha) {
        mostrarMensagem('msgCadastroEscola', 'Informe a senha do administrador.', 'danger');
        return;
    }

    const escolas = carregarEscolas();
    if (escolas.some(e => e.nome.toLowerCase() === escolaNome.toLowerCase())) {
        mostrarMensagem('msgCadastroEscola', 'Escola já cadastrada com este nome.', 'danger');
        return;
    }

    const usuarios = carregarUsuarios();
    if (usuarios.some(u => limparCpf(u.cpf) === admCpf && u.escola.toLowerCase() === escolaNome.toLowerCase())) {
        mostrarMensagem('msgCadastroEscola', 'Já existe um administrador registrado para esta escola.', 'danger');
        return;
    }

    escolas.push({
        nome: escolaNome,
        cnpj: escolaCnpj,
        email: escolaEmail,
        telefone: escolaTelefone,
        whatsapp: escolaWhatsapp,
        tipo: escolaTipo,
        endereco: {
            cep: escolaCep,
            rua: escolaRua,
            numero: escolaNumero,
            bairro: escolaBairro,
            cidade: escolaCidade,
            estado: escolaEstado
        }
    });
    salvarEscolas(escolas);

    usuarios.push({
        cpf: admRawCpf,
        senha: admSenha,
        escola: escolaNome,
        tipo: 'Administrador',
        nome: admNome
    });
    salvarUsuarios(usuarios);

    mostrarMensagem('msgCadastroEscola', 'Escola e administrador cadastrados com sucesso! Faça login com o CPF do administrador.', 'success');

    document.getElementById('escolaNome').value = '';
    document.getElementById('escolaCnpj').value = '';
    document.getElementById('escolaEmail').value = '';
    document.getElementById('escolaTelefone').value = '';
    document.getElementById('escolaWhatsapp').value = '';
    document.getElementById('escolaTipo').value = '';
    document.getElementById('escolaCep').value = '';
    document.getElementById('escolaRua').value = '';
    document.getElementById('escolaNumero').value = '';
    document.getElementById('escolaBairro').value = '';
    document.getElementById('escolaCidade').value = '';
    document.getElementById('escolaEstado').value = '';
    document.getElementById('admNome').value = '';
    document.getElementById('admCpf').value = '';
    document.getElementById('admSenha').value = '';
}

function renderSessao() {
    const sessao = carregarSessao();
    const sessionArea = document.getElementById('sessionArea');
    const loginCardFields = document.getElementById('loginCardFields');
    const sessionUsuario = document.getElementById('sessionUsuario');
    const navUserInfo = document.getElementById('navUserInfo');
    const painelAdminContent = document.getElementById('painelAdminContent');
    const acessoNegado = document.getElementById('acessoNegado');

    if (sessao) {
        if (loginCardFields) loginCardFields.classList.add('hidden');
        if (sessionArea) sessionArea.classList.remove('hidden');
        if (sessionUsuario) sessionUsuario.textContent = `Logado como ${sessao.nome || sessao.cpf} (${sessao.tipo}) na escola ${sessao.escola}.`;
        if (navUserInfo) {
            navUserInfo.textContent = `${sessao.nome || sessao.cpf} | ${sessao.tipo}`;
            navUserInfo.classList.remove('hidden');
        }
        mostrarMensagem('msgLogin', 'Sessão ativa.', 'success');

        if (painelAdminContent && acessoNegado) {
            if (sessao.tipo === 'Administrador') {
                painelAdminContent.classList.remove('hidden');
                acessoNegado.classList.add('hidden');
                listarUsuariosEscola();
            } else {
                painelAdminContent.classList.add('hidden');
                acessoNegado.classList.remove('hidden');
            }
        }
    } else {
        if (loginCardFields) loginCardFields.classList.remove('hidden');
        if (sessionArea) sessionArea.classList.add('hidden');
        if (sessionUsuario) sessionUsuario.textContent = '';
        if (navUserInfo) {
            navUserInfo.textContent = '';
            navUserInfo.classList.add('hidden');
        }
        const msgLogin = document.getElementById('msgLogin');
        if (msgLogin) msgLogin.textContent = '';

        if (painelAdminContent) painelAdminContent.classList.add('hidden');
        if (acessoNegado) acessoNegado.classList.remove('hidden');
    }
}

function carregarNotas() {
    const raw = localStorage.getItem('sge-notas');
    return raw ? JSON.parse(raw) : {};
}

function salvarNotas(notas) {
    localStorage.setItem('sge-notas', JSON.stringify(notas));
}

function getNotasAluno(cpf) {
    const notas = carregarNotas();
    return notas[cpf] || {};
}

function salvarNotasAluno() {
    const sessao = carregarSessao();
    if (!sessao || sessao.tipo !== 'Professor') {
        mostrarMensagem('msgNotas', 'Apenas professores podem salvar notas.', 'danger');
        return;
    }

    const rawAluno = document.getElementById('selectedAlunoCpf')?.value || '';
    const cpf = resolverCpfPorNomeOuCpf(rawAluno);

    if (!cpf) {
        mostrarMensagem('msgNotas', 'Aluno não encontrado ou nome ambíguo. Use a lista para selecionar.', 'danger');
        return;
    }

    const notasAluno = {};
    const materias = ['Português', 'História', 'Geografia', 'Ciência', 'Matemática', 'Educação Física', 'Arte'];
    const bimestres = [1, 2, 3, 4];

    materias.forEach((materia, mIndex) => {
        notasAluno[materia] = {};
        bimestres.forEach(bimestre => {
            const input = document.getElementById(`grade-${mIndex}-${bimestre}`);
            if (input) {
                notasAluno[materia][bimestre] = input.value.trim() || '';
            }
        });
    });

    const notas = carregarNotas();
    notas[cpf] = notasAluno;
    salvarNotas(notas);

    mostrarMensagem('msgNotas', 'Notas salvas com sucesso.', 'success');
}

function renderNotasAluno() {
    const container = document.getElementById('gradesContainer');
    const msgNotas = document.getElementById('msgNotas');
    const cfg = document.getElementById('notasAlunoConfig');
    const sessao = carregarSessao();
    const materias = ['Português', 'História', 'Geografia', 'Ciência', 'Matemática', 'Educação Física', 'Arte'];
    const bimestres = [1, 2, 3, 4];

    if (!container) return;

    if (!sessao) {
        container.innerHTML = '';
        if (cfg) cfg.classList.add('hidden');
        if (msgNotas) mostrarMensagem('msgNotas', 'Faça login para ver as notas.', 'danger');
        return;
    }

    const isProfessor = sessao.tipo === 'Professor';
    if (cfg) cfg.classList.toggle('hidden', !isProfessor);

    let alunoCpf = limparCpf(sessao.cpf);
    if (isProfessor) {
        const rawAluno = document.getElementById('selectedAlunoCpf')?.value || '';
        if (!rawAluno) {
            if (msgNotas) mostrarMensagem('msgNotas', 'Informe o nome ou CPF do aluno. Use a lista para selecionar.', 'danger');
            container.innerHTML = '';
            return;
        }
        const resolved = resolverCpfPorNomeOuCpf(rawAluno);
        if (!resolved) {
            if (msgNotas) mostrarMensagem('msgNotas', 'Aluno não encontrado ou nome ambíguo. Use a lista para selecionar.', 'danger');
            container.innerHTML = '';
            return;
        }
        alunoCpf = resolved;
    }

    if (msgNotas) msgNotas.textContent = '';
    const notasAluno = getNotasAluno(alunoCpf);

    let html = '<table class="grades-table"><thead><tr><th>Matéria</th>';
    bimestres.forEach(b => {
        html += `<th>Bimestre ${b}</th>`;
    });
    html += '</tr></thead><tbody>';

    materias.forEach((materia, mIndex) => {
        html += `<tr><th>${materia}</th>`;
        bimestres.forEach(bimestre => {
            const valor = notasAluno[materia]?.[bimestre] || '';
            if (isProfessor) {
                html += `<td><input id="grade-${mIndex}-${bimestre}" type="text" value="${valor}" placeholder="" maxlength="4"></td>`;
            } else {
                html += `<td>${valor || '-'}</td>`;
            }
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function carregarFaltas() {
    const raw = localStorage.getItem('sge-faltas');
    return raw ? JSON.parse(raw) : {};
}

function salvarFaltas(faltas) {
    localStorage.setItem('sge-faltas', JSON.stringify(faltas));
}

function getFaltasAluno(cpf) {
    const faltas = carregarFaltas();
    return {
        1: [],
        2: [],
        3: [],
        4: [],
        ...faltas[cpf]
    };
}

function contarFaltas(faltasAluno, bimestre) {
    return (faltasAluno[bimestre] || []).filter(item => item.status === 'Falta').length;
}

function getSituacaoFalta(count) {
    if (count === 0) return { emoji: '🔵', label: 'Nenhuma falta', class: 'status-blue' };
    if (count === 1) return { emoji: '🟢', label: 'Pelo menos 1 falta', class: 'status-green' };
    if (count <= 4) return { emoji: '🟡', label: 'Muitas faltas', class: 'status-yellow' };
    return { emoji: '🔴', label: 'Reprovação por falta', class: 'status-red' };
}

function salvarFaltasEmLote() {
    const sessao = carregarSessao();
    if (!sessao || sessao.tipo !== 'Professor') {
        mostrarMensagem('msgFaltas', 'Apenas professores podem registrar faltas.', 'danger');
        return;
    }

    const alunosSelecionados = Array.from(document.querySelectorAll('.bulk-aluno-checkbox:checked')).map(input => input.value);
    const data = document.getElementById('faltaData')?.value || '';
    const bimestre = Number(document.getElementById('faltaBimestre')?.value || 1);
    const presenca = document.getElementById('faltaPresenca')?.checked || false;
    const status = presenca ? 'Presença' : 'Falta';

    if (alunosSelecionados.length === 0) {
        mostrarMensagem('msgFaltas', 'Selecione pelo menos um aluno.', 'danger');
        return;
    }
    if (!data) {
        mostrarMensagem('msgFaltas', 'Informe a data da presença/falta.', 'danger');
        return;
    }

    const faltas = carregarFaltas();
    alunosSelecionados.forEach(cpf => {
        const faltasAluno = getFaltasAluno(cpf);
        faltasAluno[bimestre] = faltasAluno[bimestre] || [];
        faltasAluno[bimestre].push({ data, status });
        faltas[cpf] = faltasAluno;
    });

    salvarFaltas(faltas);

    mostrarMensagem('msgFaltas', 'Registro salvo com sucesso.', 'success');
    renderFaltasAluno();
}

function salvarFaltaRegistro() {
    salvarFaltasEmLote();
}

function renderListaAlunosParaChamada() {
    const sessao = carregarSessao();
    const container = document.getElementById('faltasBulkContainer');
    if (!sessao || sessao.tipo !== 'Professor' || !container) {
        return;
    }

    const alunos = listarAlunosDaEscola();
    if (alunos.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '<p style="color:#8defff;">Nenhum aluno encontrado para chamada.</p>';
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <strong style="color:#00e5ff;">Lista de alunos para chamada</strong>
            <button type="button" onclick="marcarTodosAlunos()" class="attendance-action">Selecionar todos</button>
        </div>
        <div class="bulk-attendance-list">
            ${alunos.map(aluno => `
                <label class="checkbox-wrapper" style="width:100%; justify-content: space-between;">
                    <span>${aluno.nome ? aluno.nome : aluno.cpf}</span>
                    <input type="checkbox" class="bulk-aluno-checkbox" value="${aluno.cpf}" />
                </label>
            `).join('')}
        </div>
    `;
}

function marcarTodosAlunos() {
    document.querySelectorAll('.bulk-aluno-checkbox').forEach(input => input.checked = true);
}

function editarFaltaRegistro(cpf, bimestre, index) {
    const sessao = carregarSessao();
    if (!sessao || sessao.tipo !== 'Professor') {
        mostrarMensagem('msgFaltas', 'Apenas professores podem editar faltas.', 'danger');
        return;
    }

    const faltas = carregarFaltas();
    const registros = faltas[cpf]?.[bimestre] || [];
    const registro = registros[index];
    if (!registro) {
        mostrarMensagem('msgFaltas', 'Registro não encontrado.', 'danger');
        return;
    }

    const novaData = prompt('Nova data:', registro.data);
    if (!novaData) {
        return;
    }

    const novoStatus = confirm('Marcar como presença? Clique em OK para Presença, Cancelar para Falta.') ? 'Presença' : 'Falta';
    registros[index] = { data: novaData, status: novoStatus };
    salvarFaltas(faltas);
    mostrarMensagem('msgFaltas', 'Registro atualizado com sucesso.', 'success');
    renderFaltasAluno();
}

function removerFaltaRegistro(cpf, bimestre, index) {
    const sessao = carregarSessao();
    if (!sessao || sessao.tipo !== 'Professor') {
        mostrarMensagem('msgFaltas', 'Apenas professores podem remover faltas.', 'danger');
        return;
    }

    if (!confirm('Deseja remover este registro?')) {
        return;
    }

    const faltas = carregarFaltas();
    const registros = faltas[cpf]?.[bimestre] || [];
    registros.splice(index, 1);
    faltas[cpf][bimestre] = registros;
    salvarFaltas(faltas);
    mostrarMensagem('msgFaltas', 'Registro removido.', 'success');
    renderFaltasAluno();
}

function renderFaltasAluno() {
    const container = document.getElementById('faltasContainer');
    const msgFaltas = document.getElementById('msgFaltas');
    const cfg = document.getElementById('faltasConfig');
    const form = document.getElementById('faltasForm');
    const sessao = carregarSessao();
    const bimestres = [1, 2, 3, 4];

    if (!container) return;

    if (!sessao) {
        container.innerHTML = '';
        if (cfg) cfg.classList.add('hidden');
        if (form) form.classList.add('hidden');
        if (msgFaltas) mostrarMensagem('msgFaltas', 'Faça login para ver as faltas.', 'danger');
        return;
    }

    const isProfessor = sessao.tipo === 'Professor';
    if (cfg) cfg.classList.toggle('hidden', !isProfessor);
    if (form) form.classList.toggle('hidden', !isProfessor);

    if (isProfessor) {
        renderListaAlunosParaChamada();
    }

    let alunoCpf = limparCpf(sessao.cpf);
    let alunoMensagem = '';
    if (isProfessor) {
        const rawAluno = document.getElementById('selectedAlunoCpf')?.value || '';
        const resolved = resolverCpfPorNomeOuCpf(rawAluno);
        if (!resolved) {
            alunoMensagem = '<p style="color:#8defff;">Informe o nome/CPF do aluno e clique em carregar faltas (use a lista se houver ambiguidades).</p>';
        } else {
            alunoCpf = resolved;
        }
    }

    if (msgFaltas) msgFaltas.textContent = '';
    const faltasAluno = getFaltasAluno(alunoCpf);

    let html = alunoMensagem;
    html += '<div class="attendance-legend"><div class="legend-item"><span class="legend-dot status-blue"></span>🔵 nenhuma falta</div>';
    html += '<div class="legend-item"><span class="legend-dot status-green"></span>🟢 pelo menos 1 falta</div>';
    html += '<div class="legend-item"><span class="legend-dot status-yellow"></span>🟡 muitas faltas</div>';
    html += '<div class="legend-item"><span class="legend-dot status-red"></span>🔴 reprovação por falta</div></div>';

    html += '<div class="attendance-summary-row">';
    bimestres.forEach(bimestre => {
        const count = contarFaltas(faltasAluno, bimestre);
        const situacao = getSituacaoFalta(count);
        html += `<div class="attendance-card"><div class="status-dot ${situacao.class}"></div><div><strong>Bimestre ${bimestre}</strong><p>${count} faltas</p><p>${situacao.emoji} ${situacao.label}</p></div></div>`;
    });
    html += '</div>';

    html += '<div class="attendance-records">';
    bimestres.forEach(bimestre => {
        const registros = faltasAluno[bimestre] || [];
        html += `<div class="attendance-group"><h3>Bimestre ${bimestre}</h3>`;
        if (registros.length === 0) {
            html += '<p>Nenhum registro.</p>';
        } else {
            html += '<ul>';
            registros.forEach((item, index) => {
                html += `<li>${item.data} - ${item.status}`;
                if (isProfessor && validarCPF(alunoCpf)) {
                    html += ` <button class="attendance-action" onclick="editarFaltaRegistro('${alunoCpf}', ${bimestre}, ${index})">Editar</button>`;
                    html += ` <button class="attendance-action remove" onclick="removerFaltaRegistro('${alunoCpf}', ${bimestre}, ${index})">Remover</button>`;
                }
                html += '</li>';
            });
            html += '</ul>';
        }
        html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
}

function listarAlunosDaEscola() {
    const sessao = carregarSessao();
    if (!sessao || sessao.tipo !== 'Professor') {
        return [];
    }

    const usuarios = carregarUsuarios();
    const alunosDaEscola = usuarios.filter(u =>
        u.tipo === 'Aluno' && u.escola.toLowerCase() === sessao.escola.toLowerCase()
    );

    return alunosDaEscola;
}

function abrirListaAlunos() {
    const modal = document.getElementById('listaAlunosModal');
    const container = document.getElementById('listaAlunosContainer');

    if (!modal || !container) return;

    const alunos = listarAlunosDaEscola();

    if (alunos.length === 0) {
        container.innerHTML = '<p style="color: #8defff; text-align: center;">Nenhum aluno encontrado nesta escola.</p>';
    } else {
        container.innerHTML = alunos.map(aluno => `
            <div class="aluno-item" onclick="selecionarAluno('${aluno.cpf}', '${(aluno.nome||'').replace(/'/g, "\\'")}')">
                <span style="font-weight: bold;">${aluno.nome ? aluno.nome : aluno.cpf}</span>
                <div style="color: #66f0ff; font-size: 12px;">${aluno.nome ? aluno.cpf : ''}</div>
            </div>
        `).join('');
    }

    modal.classList.remove('hidden');
}

function fecharListaAlunos() {
    const modal = document.getElementById('listaAlunosModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function selecionarAluno(cpf, nome) {
    const input = document.getElementById('selectedAlunoCpf');
    if (input) {
        input.value = nome && nome.trim() ? nome : cpf;
    }
    fecharListaAlunos();
    if (document.getElementById('gradesContainer')) {
        renderNotasAluno();
    }
    if (document.getElementById('faltasContainer')) {
        renderFaltasAluno();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderSessao();
    if (document.getElementById('faltasContainer')) {
        renderFaltasAluno();
    }
});

function listarUsuariosEscola() {
    const sessao = carregarSessao();
    if (!sessao || sessao.tipo !== 'Administrador') {
        mostrarMensagem('msgPainel', 'Acesso negado.', 'danger');
        return;
    }

    const usuarios = carregarUsuarios();
    const usuariosDaEscola = usuarios.filter(u => u.escola.toLowerCase() === sessao.escola.toLowerCase());

    const container = document.getElementById('usuariosContainer');
    if (!container) return;

    if (usuariosDaEscola.length === 0) {
        container.innerHTML = '<p style="color: #8defff; text-align: center; font-size: 20px; margin-top: 20px;">Nenhum usuário encontrado nesta escola.</p>';
        return;
    }

    let html = '<table class="usuarios-table"><thead><tr><th>Nome</th><th>CPF</th><th>Tipo</th><th>Ações</th></tr></thead><tbody>';

    usuariosDaEscola.forEach(usuario => {
        html += `<tr>
            <td>${usuario.nome ? usuario.nome : ''}</td>
            <td>${usuario.cpf}</td>
            <td>${usuario.tipo}</td>
            <td>
                <button onclick="mudarTipoUsuario('${usuario.cpf}')" style="margin-right: 10px;">Mudar tipo</button>
                <button onclick="removerUsuario('${usuario.cpf}')" style="background: #ff6b6b;">Remover</button>
            </td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function mudarTipoUsuario(cpf) {
    const novoTipo = prompt('Novo tipo (Aluno, Professor, Administrador):');
    if (!novoTipo || !['Aluno', 'Professor', 'Administrador'].includes(novoTipo)) {
        alert('Tipo inválido.');
        return;
    }

    const usuarios = carregarUsuarios();
    const usuario = usuarios.find(u => u.cpf === cpf);

    if (!usuario) {
        alert('Usuário não encontrado.');
        return;
    }

    usuario.tipo = novoTipo;
    salvarUsuarios(usuarios);
    mostrarMensagem('msgPainel', `Tipo do usuário ${usuario.nome || cpf} alterado para ${novoTipo}.`, 'success');
    listarUsuariosEscola();
}

function removerUsuario(cpf) {
    const usuarios = carregarUsuarios();
    const usuario = usuarios.find(u => u.cpf === cpf) || {};
    if (!confirm(`Deseja remover o usuário ${usuario.nome || cpf}?`)) {
        return;
    }

    const indexUsuario = usuarios.findIndex(u => u.cpf === cpf);

    if (indexUsuario === -1) {
        alert('Usuário não encontrado.');
        return;
    }

    usuarios.splice(indexUsuario, 1);
    salvarUsuarios(usuarios);
    mostrarMensagem('msgPainel', `Usuário ${cpf} removido com sucesso.`, 'success');
    listarUsuariosEscola();
}

function sair() {
    limparSessao();
    renderSessao();
    renderNotasAluno();
    mostrarMensagem('msgLogin', 'Você saiu com sucesso.', 'success');
}

renderSessao();
renderNotasAluno();
