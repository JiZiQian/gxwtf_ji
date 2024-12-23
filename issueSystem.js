const db = require('./mysql.js');

// 新建一期并插入多个题目
async function newissue(req, res) {
    const { name, problemIds } = req.body; // 接收问题 ID 列表
    console.log(name);
    console.log(problemIds);
    try {
        db.query(
            'INSERT INTO issues (name) VALUES (?)',
            [name],
            (err, result) => {
                if (err) return res.status(500).json({ error: '未登录' });
                const issueId = result.insertId;
                console.log(issueId);

                // 插入多个题目
                if (problemIds && problemIds.length > 0) {
                    const values = problemIds.map(problemId => [issueId, problemId]);
                    db.query(
                        'INSERT INTO issue_problem_graph (issue_id, problem_id) VALUES ?',
                        [values],
                        (err, result) => {
                            if (err) return res.status(500).json({ error: '数据库错误' + err });
                            return res.status(200).json({ message: '提交成功', issueId: issueId });
                        }
                    );
                } else {
                    return res.status(200).json({ message: '提交成功', issueId: issueId });
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 删除 issue
async function deleteIssue(req, res) {
    const { issueId } = req.query;
    try {
        db.query(
            'DELETE FROM issues WHERE id = ?',
            [issueId],
            (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json({ message: '删除成功' });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 删除空的 issue
async function deleteEmptyIssue(req, res) {
    const { issueId } = req.query;
    try {
        db.query(
            'DELETE FROM issues WHERE id = ? AND name=""',
            [issueId],
            (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json({ message: '删除成功' });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 保存 issue 基本信息
async function saveIssueBasicInfo(req, res) {
    const { issueId, name } = req.body;
    try {
        db.query(
            'UPDATE issues SET name = ? WHERE id = ?',
            [name, issueId],
            (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json({ message: '基本信息保存成功' });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 搜索题目
async function searchProblems(req, res) {
    const { query } = req.query;
    try {
        db.query(
            'SELECT * FROM problems WHERE id LIKE ? OR name LIKE ?',
            [`%${query}%`, `%${query}%`],
            (err, results) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json(results);
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 插入从属关系
async function addProblemToIssue(req, res) {
    const { issueId, problemId } = req.body;
    try {
        db.query(
            'INSERT INTO issue_problem_graph (issue_id, problem_id) VALUES (?, ?)',
            [issueId, problemId],
            (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json({ message: '题目添加成功' });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 删除从属关系
async function removeProblemFromIssue(req, res) {
    const { issueId, problemId } = req.body;
    try {
        db.query(
            'DELETE FROM issue_problem_graph WHERE issue_id = ? AND problem_id = ?',
            [issueId, problemId],
            (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json({ message: '题目删除成功' });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 查询某个 issue 中包含的题目
async function getProblemsInIssue(req, res) {
    const { issueId } = req.query;
    try {
        db.query(
            'SELECT problems.* FROM problems JOIN issue_problem_graph ON problems.id = issue_problem_graph.problem_id WHERE issue_problem_graph.issue_id = ?',
            [issueId],
            (err, results) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });
                return res.status(200).json(results);
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 保存题单
async function saveIssue(req, res) {
    const { issueId, problemIds } = req.body;
    try {
        // 删除旧的从属关系
        db.query(
            'DELETE FROM issue_problem_graph WHERE issue_id = ?',
            [issueId],
            (err, result) => {
                if (err) return res.status(500).json({ error: '数据库错误' + err });

                // 插入新的从属关系
                if (problemIds && problemIds.length > 0) {
                    const values = problemIds.map(problemId => [issueId, problemId]);
                    db.query(
                        'INSERT INTO issue_problem_graph (issue_id, problem_id) VALUES ?',
                        [values],
                        (err, result) => {
                            if (err) return res.status(500).json({ error: '数据库错误' + err });
                            return res.status(200).json({ message: '题单保存成功' });
                        }
                    );
                } else {
                    return res.status(200).json({ message: '题单保存成功' });
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
    }
}

// 获取 issue 列表
async function issueList(req, res) {
    const { sortField = 'id', sortOrder = 'DESC', page = 1, pageSize = 15, search, id } = req.query;

    // 构建 SQL 查询条件
    let query = 'SELECT * FROM issues';
    if (id) {
        query += ` WHERE id = ${db.escape(id)}`;
    } else if (search) {
        query += ` WHERE name LIKE ${db.escape('%' + search + '%')}`;
    }
    // 排序
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    // 分页
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ${pageSize} OFFSET ${offset}`;

    // 查询数据
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '查询失败', details: err });
        }
        res.json(results);
    });
}

// 获取 issue 总数
async function issueCount(req, res) {
    const { search } = req.query;
    let query = 'SELECT COUNT(*) AS count FROM issues';
    if (search) {
        query += ` WHERE name LIKE ${db.escape('%' + search + '%')}`;
    }
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: '查询失败', details: err });
        }
        res.json(results[0]);
    });
}

function init(app, fileStorage) {
    app.post('/newissue', fileStorage.single('file'), newissue);
    app.delete('/deleteissue', deleteIssue);
    app.post('/deleteEmptyIssue', deleteEmptyIssue);
    app.post('/saveIssueBasicInfo', saveIssueBasicInfo);
    app.get('/searchProblems', searchProblems);
    app.post('/addProblemToIssue', addProblemToIssue);
    app.post('/removeProblemFromIssue', removeProblemFromIssue);
    app.get('/getProblemsInIssue', getProblemsInIssue);
    app.post('/saveIssue', saveIssue);
    app.get('/issues', issueList); // 添加获取 issue 列表的路由
    app.get('/issues/count', issueCount); // 添加获取 issue 总数的路由
}

module.exports = init;